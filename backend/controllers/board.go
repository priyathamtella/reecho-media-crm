package controllers

import (
	"encoding/json"
	"fmt"

	"reecho_media_crm/database"
	"reecho_media_crm/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// ─── CREATE BOARD ─────────────────────────────────────────────────────────────

func CreateBoard(c *fiber.Ctx) error {
	_, role, _ := getAdminContext(c)
	if role != "admin" && role != "member" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins or members can create boards"})
	}

	userIDStr, _ := c.Locals("userID").(string)
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var input struct {
		Title string `json:"title"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	board := models.Board{
		ID:        uuid.New(),
		Title:     input.Title,
		OwnerID:   userID,
		FullState: json.RawMessage("{}"),
	}

	_, err = database.DB.Exec(
		`INSERT INTO boards (id, title, owner_id, full_state) VALUES ($1, $2, $3, $4)`,
		board.ID, board.Title, board.OwnerID, board.FullState,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create board: " + err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(board)
}

// ─── GET ALL BOARDS ───────────────────────────────────────────────────────────

func GetAllBoards(c *fiber.Ctx) error {
	adminIDStr, role, email := getAdminContext(c)
	adminID, _ := uuid.Parse(adminIDStr)
	realUserIDStr, _ := c.Locals("userID").(string)
	realUserID, _ := uuid.Parse(realUserIDStr)

	var boards []models.Board
	seen := map[uuid.UUID]bool{}

	// 1. Owned boards
	var owned []models.Board
	database.DB.Select(&owned, "SELECT * FROM boards WHERE owner_id = $1", realUserID)
	for _, b := range owned {
		boards = append(boards, b)
		seen[b.ID] = true
	}

	// 2. Shared via BoardAccess
	var accesses []models.BoardAccess
	database.DB.Select(&accesses, "SELECT * FROM board_accesses WHERE target_email = $1", email)
	var sharedIDs []interface{}
	for _, a := range accesses {
		if !seen[a.BoardID] {
			sharedIDs = append(sharedIDs, a.BoardID)
		}
	}
	if len(sharedIDs) > 0 {
		q, args, _ := sqlx.In("SELECT * FROM boards WHERE id IN (?)", sharedIDs)
		q = database.DB.Rebind(q)
		var shared []models.Board
		database.DB.Select(&shared, q, args...)
		for _, b := range shared {
			if !seen[b.ID] {
				boards = append(boards, b)
				seen[b.ID] = true
			}
		}
	}

	// 3. Member task-linked boards
	if role == "member" {
		var member models.TeamMember
		if err := database.DB.Get(&member, "SELECT * FROM team_members WHERE email = $1 AND deleted_at IS NULL LIMIT 1", email); err == nil {
			var linkedIDs []string
			database.DB.Select(&linkedIDs,
				"SELECT linked_board_id FROM tasks WHERE user_id=$1 AND (assignees LIKE $2 OR assignees LIKE $3) AND linked_board_id != '' AND deleted_at IS NULL",
				adminIDStr, "%"+member.Name+"%", "%"+member.Initials+"%")
			var uids []interface{}
			for _, s := range linkedIDs {
				if uid, err := uuid.Parse(s); err == nil && !seen[uid] {
					uids = append(uids, uid)
				}
			}
			if len(uids) > 0 {
				q, args, _ := sqlx.In("SELECT * FROM boards WHERE id IN (?)", uids)
				q = database.DB.Rebind(q)
				var tb []models.Board
				database.DB.Select(&tb, q, args...)
				for _, b := range tb {
					if !seen[b.ID] {
						boards = append(boards, b)
						seen[b.ID] = true
					}
				}
			}
		}
	}

	// 4. Admin workspace pool
	if role == "admin" {
		var memberIDs []uuid.UUID
		database.DB.Select(&memberIDs,
			"SELECT u.id FROM users u INNER JOIN team_members tm ON tm.email = u.email WHERE tm.user_id = $1 AND tm.deleted_at IS NULL",
			adminIDStr)
		var pool []models.Board
		if len(memberIDs) > 0 {
			args := []interface{}{adminID}
			for _, mid := range memberIDs {
				args = append(args, mid)
			}
			q, a, _ := sqlx.In("SELECT * FROM boards WHERE owner_id = ? OR owner_id IN (?)", adminID, memberIDs)
			q = database.DB.Rebind(q)
			database.DB.Select(&pool, q, a...)
		} else {
			database.DB.Select(&pool, "SELECT * FROM boards WHERE owner_id = $1", adminID)
		}
		for _, b := range pool {
			if !seen[b.ID] {
				boards = append(boards, b)
				seen[b.ID] = true
			}
		}
	}

	if boards == nil {
		boards = []models.Board{}
	}
	return c.JSON(boards)
}

// ─── GET BOARD ────────────────────────────────────────────────────────────────

func GetBoard(c *fiber.Ctx) error {
	adminIDStr, role, email := getAdminContext(c)
	boardID := c.Params("id")
	parsedID, _ := uuid.Parse(boardID)
	userIDStr, _ := c.Locals("userID").(string)
	userID, _ := uuid.Parse(userIDStr)

	var board models.Board
	perm := "viewer"

	// Owner check
	if err := database.DB.Get(&board, "SELECT * FROM boards WHERE id = $1 AND owner_id = $2 LIMIT 1", parsedID, userID); err == nil {
		return c.JSON(fiber.Map{"board": board, "permission": "editor"})
	}

	// Member task-linked check
	if role == "member" {
		var member models.TeamMember
		database.DB.Get(&member, "SELECT * FROM team_members WHERE email = $1 AND deleted_at IS NULL LIMIT 1", email)
		var task models.Task
		if err := database.DB.Get(&task,
			"SELECT * FROM tasks WHERE user_id=$1 AND (assignees LIKE $2 OR assignees LIKE $3) AND linked_board_id=$4 AND deleted_at IS NULL LIMIT 1",
			adminIDStr, "%"+member.Name+"%", "%"+member.Initials+"%", boardID,
		); err == nil {
			if err2 := database.DB.Get(&board, "SELECT * FROM boards WHERE id = $1 LIMIT 1", parsedID); err2 == nil {
				return c.JSON(fiber.Map{"board": board, "permission": "editor"})
			}
		}
	}

	// Shared via BoardAccess
	var access models.BoardAccess
	if err := database.DB.Get(&access,
		"SELECT * FROM board_accesses WHERE board_id = $1 AND target_email = $2 LIMIT 1", parsedID, email,
	); err == nil {
		if err2 := database.DB.Get(&board, "SELECT * FROM boards WHERE id = $1 LIMIT 1", parsedID); err2 == nil {
			perm = access.Permission
			return c.JSON(fiber.Map{"board": board, "permission": perm})
		}
	}

	// Admin fallback
	if role == "admin" {
		adminID, _ := uuid.Parse(adminIDStr)
		if err := database.DB.Get(&board, "SELECT * FROM boards WHERE id = $1 AND owner_id = $2 LIMIT 1", parsedID, adminID); err == nil {
			return c.JSON(fiber.Map{"board": board, "permission": "editor"})
		}
		var memberIDs []uuid.UUID
		database.DB.Select(&memberIDs,
			"SELECT u.id FROM users u INNER JOIN team_members tm ON tm.email = u.email WHERE tm.user_id = $1 AND tm.deleted_at IS NULL",
			adminIDStr)
		if len(memberIDs) > 0 {
			q, args, _ := sqlx.In("SELECT * FROM boards WHERE id = ? AND owner_id IN (?) LIMIT 1", parsedID, memberIDs)
			q = database.DB.Rebind(q)
			if err := database.DB.Get(&board, q, args...); err == nil {
				return c.JSON(fiber.Map{"board": board, "permission": "editor"})
			}
		}
	}

	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Board not found or no access"})
}

// ─── SYNC BOARD ───────────────────────────────────────────────────────────────

func SyncBoard(c *fiber.Ctx) error {
	id := c.Params("id")
	parsedID, _ := uuid.Parse(id)
	adminIDStr, role, email := getAdminContext(c)
	realUserIDStr, _ := c.Locals("userID").(string)
	realUserID, _ := uuid.Parse(realUserIDStr)

	type Payload struct {
		Title          string      `json:"title"`
		FullState      string      `json:"fullState"`
		ClientStatus   string      `json:"clientStatus"`
		ClientFeedback string      `json:"clientFeedback"`
		LinkedTaskID   interface{} `json:"linkedTaskId"`
		LinkedDocID    interface{} `json:"linkedDocId"`
	}
	var payload Payload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid JSON"})
	}

	var board models.Board
	canEdit := false

	if role == "admin" {
		adminID, _ := uuid.Parse(adminIDStr)
		if err := database.DB.Get(&board, "SELECT * FROM boards WHERE id = $1 AND owner_id = $2 LIMIT 1", parsedID, adminID); err == nil {
			canEdit = true
		} else {
			var memberIDs []uuid.UUID
			database.DB.Select(&memberIDs,
				"SELECT u.id FROM users u INNER JOIN team_members tm ON tm.email = u.email WHERE tm.user_id = $1 AND tm.deleted_at IS NULL",
				adminIDStr)
			if len(memberIDs) > 0 {
				q, args, _ := sqlx.In("SELECT * FROM boards WHERE id = ? AND owner_id IN (?) LIMIT 1", parsedID, memberIDs)
				q = database.DB.Rebind(q)
				if err := database.DB.Get(&board, q, args...); err == nil {
					canEdit = true
				}
			}
		}
	} else {
		if err := database.DB.Get(&board, "SELECT * FROM boards WHERE id = $1 AND owner_id = $2 LIMIT 1", parsedID, realUserID); err == nil {
			canEdit = true
		} else {
			var access models.BoardAccess
			if err2 := database.DB.Get(&access,
				"SELECT * FROM board_accesses WHERE board_id = $1 AND target_email = $2 AND permission = 'editor' LIMIT 1",
				parsedID, email,
			); err2 == nil {
				if err3 := database.DB.Get(&board, "SELECT * FROM boards WHERE id = $1 LIMIT 1", parsedID); err3 == nil {
					canEdit = true
				}
			}
		}
	}

	// Client feedback-only path
	if !canEdit && role == "client" {
		var access models.BoardAccess
		if err := database.DB.Get(&access,
			"SELECT * FROM board_accesses WHERE board_id = $1 AND target_email = $2 LIMIT 1", parsedID, email,
		); err == nil {
			if err2 := database.DB.Get(&board, "SELECT * FROM boards WHERE id = $1 LIMIT 1", parsedID); err2 == nil {
				if payload.ClientStatus != "" {
					board.ClientStatus = payload.ClientStatus
				}
				if payload.ClientFeedback != "" {
					board.ClientFeedback = payload.ClientFeedback
				}
				database.DB.Exec(
					"UPDATE boards SET client_status=$1, client_feedback=$2, updated_at=NOW() WHERE id=$3",
					board.ClientStatus, board.ClientFeedback, board.ID,
				)
				return c.JSON(fiber.Map{"message": "Feedback saved", "board": board})
			}
		}
	}

	if !canEdit {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied or view-only"})
	}

	// Apply updates
	if payload.Title != "" {
		board.Title = payload.Title
	}
	if payload.FullState != "" {
		board.FullState = json.RawMessage(payload.FullState)
	}
	if payload.ClientStatus != "" {
		board.ClientStatus = payload.ClientStatus
	}
	if payload.ClientFeedback != "" {
		board.ClientFeedback = payload.ClientFeedback
	}
	if payload.LinkedTaskID != nil {
		strTID := fmt.Sprintf("%v", payload.LinkedTaskID)
		if strTID != "" && strTID != "0" && strTID != "<nil>" {
			var tid uint
			fmt.Sscanf(strTID, "%d", &tid)
			board.LinkedTaskID = tid
		} else {
			board.LinkedTaskID = 0
		}
	}
	if payload.LinkedDocID != nil {
		strID := fmt.Sprintf("%v", payload.LinkedDocID)
		if strID == "" || strID == "<nil>" {
			board.LinkedDocID = nil
		} else if bid, err := uuid.Parse(strID); err == nil {
			board.LinkedDocID = &bid
		}
	}

	database.DB.Exec(
		`UPDATE boards SET title=$1, full_state=$2, client_status=$3, client_feedback=$4,
		 linked_task_id=$5, linked_doc_id=$6, updated_at=NOW() WHERE id=$7`,
		board.Title, board.FullState, board.ClientStatus, board.ClientFeedback,
		board.LinkedTaskID, board.LinkedDocID, board.ID,
	)
	return c.JSON(fiber.Map{"message": "Board synced", "board": board})
}

// ─── DELETE BOARD ─────────────────────────────────────────────────────────────

func DeleteBoard(c *fiber.Ctx) error {
	boardID := c.Params("id")
	parsedID, _ := uuid.Parse(boardID)
	adminIDStr, role, _ := getAdminContext(c)
	realUserIDStr, _ := c.Locals("userID").(string)
	realUserID, _ := uuid.Parse(realUserIDStr)

	var board models.Board
	if err := database.DB.Get(&board, "SELECT * FROM boards WHERE id = $1 LIMIT 1", parsedID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Board not found"})
	}

	canDelete := false
	if role == "admin" {
		adminID, _ := uuid.Parse(adminIDStr)
		if board.OwnerID == adminID {
			canDelete = true
		} else {
			var cnt int
			database.DB.Get(&cnt,
				"SELECT COUNT(*) FROM team_members tm INNER JOIN users u ON u.email = tm.email WHERE tm.user_id = $1 AND u.id = $2 AND tm.deleted_at IS NULL",
				adminIDStr, board.OwnerID)
			canDelete = cnt > 0
		}
	} else if board.OwnerID == realUserID {
		canDelete = true
	}

	if !canDelete {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Permission denied"})
	}

	database.DB.Exec("DELETE FROM board_accesses WHERE board_id = $1", board.ID)
	database.DB.Exec("DELETE FROM boards WHERE id = $1", board.ID)
	return c.JSON(fiber.Map{"message": "Board deleted"})
}
