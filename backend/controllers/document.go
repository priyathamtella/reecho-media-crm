package controllers

import (
	"fmt"
	"reecho_media_crm/database"
	"reecho_media_crm/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// CreateDocument: Create a new rich-text document (admin or member)
func CreateDocument(c *fiber.Ctx) error {
	_, role, _ := getAdminContext(c)
	if role != "admin" && role != "member" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins or members can create documents"})
	}

	userIDStr, ok := c.Locals("userID").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, _ := uuid.Parse(userIDStr)

	var input struct {
		Title         string  `json:"title"`
		LinkedBoardID *string `json:"linkedBoardId"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}
	if input.Title == "" {
		input.Title = "Untitled Document"
	}

	doc := models.Document{
		Title:   input.Title,
		Content: "",
		OwnerID: userID,
	}

	// Optionally link to a board
	if input.LinkedBoardID != nil && *input.LinkedBoardID != "" {
		bid, err := uuid.Parse(*input.LinkedBoardID)
		if err == nil {
			doc.LinkedBoardID = &bid
		}
	}

	if err := database.DB.Create(&doc).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not create document: " + err.Error()})
	}
	return c.Status(201).JSON(doc)
}

// GetAllDocuments: List all documents for the authenticated user (owned + shared)
func GetAllDocuments(c *fiber.Ctx) error {
	userIDStr, ok := c.Locals("userID").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, _ := uuid.Parse(userIDStr)
	adminIDStr, role, email := getAdminContext(c)

	var docs []models.Document
	seen := map[uuid.UUID]bool{}
	
	// 1. Owned
	var ownDocs []models.Document
	database.DB.Where("owner_id = ?", userID).Order("updated_at desc").Find(&ownDocs)
	for _, d := range ownDocs {
		docs = append(docs, d)
		seen[d.ID] = true
	}

	// 2. Shared via DocAccess
	var accesses []models.DocAccess
	database.DB.Where("target_email = ?", email).Find(&accesses)
	
	var sharedIDs []uuid.UUID
	for _, a := range accesses {
		sharedIDs = append(sharedIDs, a.DocID)
	}

	if len(sharedIDs) > 0 {
		var sharedDocs []models.Document
		database.DB.Where("id IN ?", sharedIDs).Order("updated_at desc").Find(&sharedDocs)
		for _, d := range sharedDocs {
			if !seen[d.ID] {
				docs = append(docs, d)
				seen[d.ID] = true
			}
		}
	}

	// 4. Assigned Task docs (for members)
	// NOTE: Admin-owned docs are NOT automatically shown to members.
	// Members only see docs they own (step 1) or docs explicitly shared (step 2).
	if role == "member" {
		var member models.TeamMember
		if err := database.DB.Where("email = ?", email).First(&member).Error; err == nil {
			var taskIDs []uint
			database.DB.Model(&models.Task{}).
				Where("user_id = ? AND (assignees LIKE ? OR assignees LIKE ?)",
					adminIDStr, "%"+member.Name+"%", "%"+member.Initials+"%").
				Pluck("id", &taskIDs)

			if len(taskIDs) > 0 {
				var taskDocs []models.Document
				database.DB.Where("linked_task_id IN ?", taskIDs).Find(&taskDocs)
				for _, d := range taskDocs {
					if !seen[d.ID] {
						docs = append(docs, d)
						seen[d.ID] = true
					}
				}
			}
			// Admin-owned docs are NOT added here. Members only see their own
			// docs and docs the admin explicitly shared with them.
		}
	}

	// 5. Admin pool view (Admins see everything in their workspace)
	if role == "admin" {
		adminID, _ := uuid.Parse(adminIDStr)
		var memberIDs []uuid.UUID
		database.DB.Table("users").
			Select("users.id").
			Joins("inner join team_members on team_members.email = users.email").
			Where("team_members.user_id = ?", adminIDStr).
			Find(&memberIDs)

		var adminPoolDocs []models.Document
		query := database.DB.Where("owner_id = ?", adminID)
		if len(memberIDs) > 0 {
			query = database.DB.Where("owner_id = ? OR owner_id IN ?", adminID, memberIDs)
		}
		query.Order("updated_at desc").Find(&adminPoolDocs)

		for _, d := range adminPoolDocs {
			if !seen[d.ID] {
				docs = append(docs, d)
				seen[d.ID] = true
			}
		}
	}

	return c.JSON(docs)
}

// GetDocument: Get a single document by ID (owned or shared)
func GetDocument(c *fiber.Ctx) error {
	userIDStr := c.Locals("userID").(string)
	userID, _ := uuid.Parse(userIDStr)
	adminIDStr, role, email := getAdminContext(c)
	docID := c.Params("id")
	parsedDocID, _ := uuid.Parse(docID)

	var doc models.Document
	permission := "viewer"

	// 1. Owned
	err := database.DB.Where("id = ? AND owner_id = ?", docID, userID).First(&doc).Error
	if err == nil {
		permission = "editor"
		return c.JSON(fiber.Map{
			"doc":        doc,
			"permission": permission,
		})
	}

	// 2. Task assignment check (for members)
	if role == "member" {
		var member models.TeamMember
		database.DB.Where("email = ?", email).First(&member)
		var task models.Task
		// Check for task assigned to this member that is linked to this doc
		// Note: doc.LinkedTaskID is uint, task.ID is uint
		errT := database.DB.Where("user_id = ? AND (assignees LIKE ? OR assignees LIKE ?)",
			adminIDStr, "%"+member.Name+"%", "%"+member.Initials+"%").
			Joins("inner join documents on documents.linked_task_id = tasks.id").
			Where("documents.id = ?", docID).First(&task).Error
		if errT == nil {
			if err2 := database.DB.Where("id = ?", docID).First(&doc).Error; err2 == nil {
				permission = "editor"
				return c.JSON(fiber.Map{
					"doc":        doc,
					"permission": permission,
				})
			}
		}
	}

	// 3. Shared
	var access models.DocAccess
	err = database.DB.Where("doc_id = ? AND target_email = ?", parsedDocID, email).First(&access).Error
	if err == nil {
		if err2 := database.DB.Where("id = ?", docID).First(&doc).Error; err2 == nil {
			permission = access.Permission
			return c.JSON(fiber.Map{
				"doc":        doc,
				"permission": permission,
			})
		}
	}

	if role == "admin" {
		adminID, _ := uuid.Parse(adminIDStr)
		if err := database.DB.Where("id = ? AND owner_id = ?", docID, adminID).First(&doc).Error; err == nil {
			permission = "editor"
			return c.JSON(fiber.Map{
				"doc":        doc,
				"permission": permission,
			})
		} else {
			// Check if the owner is a team member managed by this admin
			var memberIDs []uuid.UUID
			database.DB.Table("users").
				Select("users.id").
				Joins("inner join team_members on team_members.email = users.email").
				Where("team_members.user_id = ?", adminIDStr).
				Find(&memberIDs)
			
			if len(memberIDs) > 0 {
				if err := database.DB.Where("id = ? AND owner_id IN ?", docID, memberIDs).First(&doc).Error; err == nil {
					permission = "editor"
					return c.JSON(fiber.Map{
						"doc":        doc,
						"permission": permission,
					})
				}
			}
		}
	}

	return c.Status(404).JSON(fiber.Map{"error": "Document not found"})
}

// UpdateDocument: Save document content + title (owned or shared)
func UpdateDocument(c *fiber.Ctx) error {
	userIDStr := c.Locals("userID").(string)
	userID, _ := uuid.Parse(userIDStr)
	adminIDStr, role, email := getAdminContext(c)
	docID := c.Params("id")
	parsedDocID, _ := uuid.Parse(docID)

	var doc models.Document
	var canEdit bool = false

	// Check eligibility
	if role == "admin" {
		adminID, _ := uuid.Parse(adminIDStr)
		if err := database.DB.Where("id = ? AND owner_id = ?", docID, adminID).First(&doc).Error; err == nil {
			canEdit = true
		} else {
			// Check if the owner is a team member managed by this admin
			var memberIDs []uuid.UUID
			database.DB.Table("users").
				Select("users.id").
				Joins("inner join team_members on team_members.email = users.email").
				Where("team_members.user_id = ?", adminIDStr).
				Find(&memberIDs)
			
			if len(memberIDs) > 0 {
				if err := database.DB.Where("id = ? AND owner_id IN ?", docID, memberIDs).First(&doc).Error; err == nil {
					canEdit = true
				}
			}
		}
	} else {
		// Owned
		if err := database.DB.Where("id = ? AND owner_id = ?", docID, userID).First(&doc).Error; err == nil {
			canEdit = true
		} else {
			// Shared as editor
			var access models.DocAccess
			if err2 := database.DB.Where("doc_id = ? AND target_email = ? AND permission = 'editor'", parsedDocID, email).First(&access).Error; err2 == nil {
				if err3 := database.DB.Where("id = ?", docID).First(&doc).Error; err3 == nil {
					canEdit = true
				}
			}
		}
	}

	if !canEdit {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied or read-only mode"})
	}

	type UpdatePayload struct {
		Title         string      `json:"title"`
		Content       string      `json:"content"`
		LinkedBoardID *string     `json:"linkedBoardId"`
		LinkedTaskID  interface{} `json:"linkedTaskId"`
	}
	var payload UpdatePayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid payload"})
	}

	if payload.Title != "" {
		doc.Title = payload.Title
	}
	doc.Content = payload.Content

	if payload.LinkedBoardID != nil {
		if *payload.LinkedBoardID == "" {
			doc.LinkedBoardID = nil
		} else {
			bid, err := uuid.Parse(*payload.LinkedBoardID)
			if err == nil {
				doc.LinkedBoardID = &bid
			}
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

	if err := database.DB.Save(&doc).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save document"})
	}
	return c.JSON(doc)
}

// DeleteDocument: Permanently delete a document
func DeleteDocument(c *fiber.Ctx) error {
	userIDStr := c.Locals("userID").(string)
	userID, _ := uuid.Parse(userIDStr)
	docID := c.Params("id")

	var doc models.Document
	if err := database.DB.Where("id = ? AND owner_id = ?", docID, userID).First(&doc).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Document not found"})
	}
	if err := database.DB.Delete(&doc).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete document"})
	}
	return c.JSON(fiber.Map{"message": "Document deleted"})
}

// GetDocumentsByBoard: Get all documents linked to a specific board (accessible to user)
func GetDocumentsByBoard(c *fiber.Ctx) error {
	userIDStr := c.Locals("userID").(string)
	userID, _ := uuid.Parse(userIDStr)
	_, _, email := getAdminContext(c)
	boardID := c.Params("boardId")

	var docs []models.Document
	
	// Owned docs linked to board
	database.DB.Where("linked_board_id = ? AND owner_id = ?", boardID, userID).Find(&docs)
	
	// Shared docs linked to board
	var sharedAccess []models.DocAccess
	database.DB.Where("target_email = ?", email).Find(&sharedAccess)
	
	var sharedIDs []uuid.UUID
	for _, a := range sharedAccess {
		sharedIDs = append(sharedIDs, a.DocID)
	}
	
	if len(sharedIDs) > 0 {
		var sharedDocs []models.Document
		database.DB.Where("linked_board_id = ? AND id IN ?", boardID, sharedIDs).Find(&sharedDocs)
		// Simple merge avoiding duplicates
		seen := map[uuid.UUID]bool{}
		for _, d := range docs { seen[d.ID] = true }
		for _, sd := range sharedDocs {
			if !seen[sd.ID] {
				docs = append(docs, sd)
			}
		}
	}

	return c.JSON(docs)
}
