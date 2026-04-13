package controllers

import (
	"fmt"

	"reecho_media_crm/database"
	"reecho_media_crm/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// ─── CREATE DOCUMENT ──────────────────────────────────────────────────────────

func CreateDocument(c *fiber.Ctx) error {
	_, role, _ := getAdminContext(c)
	if role != "admin" && role != "member" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins or members can create documents"})
	}

	userIDStr, _ := c.Locals("userID").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var input struct {
		Title         string  `json:"title"`
		LinkedBoardID *string `json:"linkedBoardId"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	if input.Title == "" {
		input.Title = "Untitled Document"
	}

	doc := models.Document{
		ID:      uuid.New(),
		Title:   input.Title,
		Content: "",
		OwnerID: userID,
	}
	if input.LinkedBoardID != nil && *input.LinkedBoardID != "" {
		if bid, err := uuid.Parse(*input.LinkedBoardID); err == nil {
			doc.LinkedBoardID = &bid
		}
	}

	_, err = database.DB.Exec(
		`INSERT INTO documents (id, title, content, owner_id, linked_board_id, linked_task_id)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		doc.ID, doc.Title, doc.Content, doc.OwnerID, doc.LinkedBoardID, doc.LinkedTaskID,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create document: " + err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(doc)
}

// ─── GET ALL DOCUMENTS ────────────────────────────────────────────────────────

func GetAllDocuments(c *fiber.Ctx) error {
	userIDStr, _ := c.Locals("userID").(string)
	userID, _ := uuid.Parse(userIDStr)
	adminIDStr, role, email := getAdminContext(c)

	var docs []models.Document
	seen := map[uuid.UUID]bool{}

	// 1. Owned
	var owned []models.Document
	database.DB.Select(&owned, "SELECT * FROM documents WHERE owner_id = $1 ORDER BY updated_at DESC", userID)
	for _, d := range owned {
		docs = append(docs, d)
		seen[d.ID] = true
	}

	// 2. Shared via DocAccess
	var accesses []models.DocAccess
	database.DB.Select(&accesses, "SELECT * FROM doc_accesses WHERE target_email = $1", email)
	var sharedIDs []interface{}
	for _, a := range accesses {
		if !seen[a.DocID] {
			sharedIDs = append(sharedIDs, a.DocID)
		}
	}
	if len(sharedIDs) > 0 {
		q, args, _ := sqlx.In("SELECT * FROM documents WHERE id IN (?) ORDER BY updated_at DESC", sharedIDs)
		q = database.DB.Rebind(q)
		var shared []models.Document
		database.DB.Select(&shared, q, args...)
		for _, d := range shared {
			if !seen[d.ID] {
				docs = append(docs, d)
				seen[d.ID] = true
			}
		}
	}

	// 3. Member task-linked docs
	if role == "member" {
		var member models.TeamMember
		if err := database.DB.Get(&member, "SELECT * FROM team_members WHERE email = $1 AND deleted_at IS NULL LIMIT 1", email); err == nil {
			var taskIDs []uint
			database.DB.Select(&taskIDs,
				"SELECT id FROM tasks WHERE user_id=$1 AND (assignees LIKE $2 OR assignees LIKE $3) AND deleted_at IS NULL",
				adminIDStr, "%"+member.Name+"%", "%"+member.Initials+"%")
			if len(taskIDs) > 0 {
				args := make([]interface{}, len(taskIDs))
				for i, tid := range taskIDs {
					args[i] = tid
				}
				q, a, _ := sqlx.In("SELECT * FROM documents WHERE linked_task_id IN (?)", args)
				q = database.DB.Rebind(q)
				var taskDocs []models.Document
				database.DB.Select(&taskDocs, q, a...)
				for _, d := range taskDocs {
					if !seen[d.ID] {
						docs = append(docs, d)
						seen[d.ID] = true
					}
				}
			}
		}
	}

	// 4. Admin workspace pool
	if role == "admin" {
		adminID, _ := uuid.Parse(adminIDStr)
		var memberIDs []uuid.UUID
		database.DB.Select(&memberIDs,
			"SELECT u.id FROM users u INNER JOIN team_members tm ON tm.email = u.email WHERE tm.user_id = $1 AND tm.deleted_at IS NULL",
			adminIDStr)
		var pool []models.Document
		if len(memberIDs) > 0 {
			q, args, _ := sqlx.In("SELECT * FROM documents WHERE owner_id = ? OR owner_id IN (?) ORDER BY updated_at DESC", adminID, memberIDs)
			q = database.DB.Rebind(q)
			database.DB.Select(&pool, q, args...)
		} else {
			database.DB.Select(&pool, "SELECT * FROM documents WHERE owner_id = $1 ORDER BY updated_at DESC", adminID)
		}
		for _, d := range pool {
			if !seen[d.ID] {
				docs = append(docs, d)
				seen[d.ID] = true
			}
		}
	}

	if docs == nil {
		docs = []models.Document{}
	}
	return c.JSON(docs)
}

// ─── GET DOCUMENT ─────────────────────────────────────────────────────────────

func GetDocument(c *fiber.Ctx) error {
	userIDStr, _ := c.Locals("userID").(string)
	userID, _ := uuid.Parse(userIDStr)
	adminIDStr, role, email := getAdminContext(c)
	docID := c.Params("id")
	parsedID, _ := uuid.Parse(docID)

	var doc models.Document

	// 1. Owned
	if err := database.DB.Get(&doc, "SELECT * FROM documents WHERE id = $1 AND owner_id = $2 LIMIT 1", parsedID, userID); err == nil {
		return c.JSON(fiber.Map{"doc": doc, "permission": "editor"})
	}

	// 2. Member task-linked
	if role == "member" {
		var member models.TeamMember
		database.DB.Get(&member, "SELECT * FROM team_members WHERE email = $1 AND deleted_at IS NULL LIMIT 1", email)
		var task models.Task
		err := database.DB.Get(&task,
			`SELECT t.* FROM tasks t
			 INNER JOIN documents d ON d.linked_task_id = t.id
			 WHERE t.user_id=$1 AND (t.assignees LIKE $2 OR t.assignees LIKE $3) AND d.id=$4 AND t.deleted_at IS NULL LIMIT 1`,
			adminIDStr, "%"+member.Name+"%", "%"+member.Initials+"%", parsedID,
		)
		if err == nil {
			if err2 := database.DB.Get(&doc, "SELECT * FROM documents WHERE id = $1 LIMIT 1", parsedID); err2 == nil {
				return c.JSON(fiber.Map{"doc": doc, "permission": "editor"})
			}
		}
	}

	// 3. Shared via DocAccess
	var access models.DocAccess
	if err := database.DB.Get(&access,
		"SELECT * FROM doc_accesses WHERE doc_id = $1 AND target_email = $2 LIMIT 1", parsedID, email,
	); err == nil {
		if err2 := database.DB.Get(&doc, "SELECT * FROM documents WHERE id = $1 LIMIT 1", parsedID); err2 == nil {
			return c.JSON(fiber.Map{"doc": doc, "permission": access.Permission})
		}
	}

	// 4. Admin fallback
	if role == "admin" {
		adminID, _ := uuid.Parse(adminIDStr)
		if err := database.DB.Get(&doc, "SELECT * FROM documents WHERE id = $1 AND owner_id = $2 LIMIT 1", parsedID, adminID); err == nil {
			return c.JSON(fiber.Map{"doc": doc, "permission": "editor"})
		}
		var memberIDs []uuid.UUID
		database.DB.Select(&memberIDs,
			"SELECT u.id FROM users u INNER JOIN team_members tm ON tm.email = u.email WHERE tm.user_id = $1 AND tm.deleted_at IS NULL",
			adminIDStr)
		if len(memberIDs) > 0 {
			q, args, _ := sqlx.In("SELECT * FROM documents WHERE id = ? AND owner_id IN (?) LIMIT 1", parsedID, memberIDs)
			q = database.DB.Rebind(q)
			if err := database.DB.Get(&doc, q, args...); err == nil {
				return c.JSON(fiber.Map{"doc": doc, "permission": "editor"})
			}
		}
	}

	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Document not found"})
}

// ─── UPDATE DOCUMENT ──────────────────────────────────────────────────────────

func UpdateDocument(c *fiber.Ctx) error {
	userIDStr, _ := c.Locals("userID").(string)
	userID, _ := uuid.Parse(userIDStr)
	adminIDStr, role, email := getAdminContext(c)
	docID := c.Params("id")
	parsedID, _ := uuid.Parse(docID)

	var doc models.Document
	canEdit := false

	if role == "admin" {
		adminID, _ := uuid.Parse(adminIDStr)
		if err := database.DB.Get(&doc, "SELECT * FROM documents WHERE id = $1 AND owner_id = $2 LIMIT 1", parsedID, adminID); err == nil {
			canEdit = true
		} else {
			var memberIDs []uuid.UUID
			database.DB.Select(&memberIDs,
				"SELECT u.id FROM users u INNER JOIN team_members tm ON tm.email = u.email WHERE tm.user_id = $1 AND tm.deleted_at IS NULL",
				adminIDStr)
			if len(memberIDs) > 0 {
				q, args, _ := sqlx.In("SELECT * FROM documents WHERE id = ? AND owner_id IN (?) LIMIT 1", parsedID, memberIDs)
				q = database.DB.Rebind(q)
				if err := database.DB.Get(&doc, q, args...); err == nil {
					canEdit = true
				}
			}
		}
	} else {
		if err := database.DB.Get(&doc, "SELECT * FROM documents WHERE id = $1 AND owner_id = $2 LIMIT 1", parsedID, userID); err == nil {
			canEdit = true
		} else {
			var access models.DocAccess
			if err2 := database.DB.Get(&access,
				"SELECT * FROM doc_accesses WHERE doc_id = $1 AND target_email = $2 AND permission = 'editor' LIMIT 1",
				parsedID, email,
			); err2 == nil {
				if err3 := database.DB.Get(&doc, "SELECT * FROM documents WHERE id = $1 LIMIT 1", parsedID); err3 == nil {
					canEdit = true
				}
			}
		}
	}

	if !canEdit {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied or read-only"})
	}

	type UpdatePayload struct {
		Title         string      `json:"title"`
		Content       string      `json:"content"`
		LinkedBoardID *string     `json:"linkedBoardId"`
		LinkedTaskID  interface{} `json:"linkedTaskId"`
	}
	var payload UpdatePayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid payload"})
	}

	if payload.Title != "" {
		doc.Title = payload.Title
	}
	doc.Content = payload.Content
	if payload.LinkedBoardID != nil {
		if *payload.LinkedBoardID == "" {
			doc.LinkedBoardID = nil
		} else if bid, err := uuid.Parse(*payload.LinkedBoardID); err == nil {
			doc.LinkedBoardID = &bid
		}
	}
	if payload.LinkedTaskID != nil {
		strTID := fmt.Sprintf("%v", payload.LinkedTaskID)
		if strTID != "" && strTID != "0" && strTID != "<nil>" {
			var tid uint
			fmt.Sscanf(strTID, "%d", &tid)
			doc.LinkedTaskID = tid
		} else {
			doc.LinkedTaskID = 0
		}
	}

	database.DB.Exec(
		"UPDATE documents SET title=$1, content=$2, linked_board_id=$3, linked_task_id=$4, updated_at=NOW() WHERE id=$5",
		doc.Title, doc.Content, doc.LinkedBoardID, doc.LinkedTaskID, doc.ID,
	)
	return c.JSON(doc)
}

// ─── DELETE DOCUMENT ──────────────────────────────────────────────────────────

func DeleteDocument(c *fiber.Ctx) error {
	adminIDStr, role, _ := getAdminContext(c)
	realUserIDStr, _ := c.Locals("userID").(string)
	realUserID, _ := uuid.Parse(realUserIDStr)
	docID := c.Params("id")
	parsedID, _ := uuid.Parse(docID)

	var doc models.Document
	if err := database.DB.Get(&doc, "SELECT * FROM documents WHERE id = $1 LIMIT 1", parsedID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Document not found"})
	}

	canDelete := false
	if role == "admin" {
		adminID, _ := uuid.Parse(adminIDStr)
		if doc.OwnerID == adminID {
			canDelete = true
		} else {
			var cnt int
			database.DB.Get(&cnt,
				"SELECT COUNT(*) FROM team_members tm INNER JOIN users u ON u.email = tm.email WHERE tm.user_id = $1 AND u.id = $2 AND tm.deleted_at IS NULL",
				adminIDStr, doc.OwnerID)
			canDelete = cnt > 0
		}
	} else if doc.OwnerID == realUserID {
		canDelete = true
	}

	if !canDelete {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Permission denied"})
	}

	database.DB.Exec("DELETE FROM doc_accesses WHERE doc_id = $1", doc.ID)
	database.DB.Exec("DELETE FROM documents WHERE id = $1", doc.ID)
	return c.JSON(fiber.Map{"message": "Document deleted"})
}

// ─── GET DOCS BY BOARD ────────────────────────────────────────────────────────

func GetDocumentsByBoard(c *fiber.Ctx) error {
	userIDStr, _ := c.Locals("userID").(string)
	userID, _ := uuid.Parse(userIDStr)
	_, _, email := getAdminContext(c)
	boardID := c.Params("boardId")
	parsedBoardID, _ := uuid.Parse(boardID)

	var docs []models.Document
	seen := map[uuid.UUID]bool{}

	database.DB.Select(&docs,
		"SELECT * FROM documents WHERE linked_board_id = $1 AND owner_id = $2", parsedBoardID, userID)
	for _, d := range docs {
		seen[d.ID] = true
	}

	var accesses []models.DocAccess
	database.DB.Select(&accesses, "SELECT * FROM doc_accesses WHERE target_email = $1", email)
	var sharedIDs []interface{}
	for _, a := range accesses {
		if !seen[a.DocID] {
			sharedIDs = append(sharedIDs, a.DocID)
		}
	}
	if len(sharedIDs) > 0 {
		q, args, _ := sqlx.In("SELECT * FROM documents WHERE linked_board_id = ? AND id IN (?)", parsedBoardID, sharedIDs)
		q = database.DB.Rebind(q)
		var shared []models.Document
		database.DB.Select(&shared, q, args...)
		for _, d := range shared {
			if !seen[d.ID] {
				docs = append(docs, d)
			}
		}
	}

	if docs == nil {
		docs = []models.Document{}
	}
	return c.JSON(docs)
}
