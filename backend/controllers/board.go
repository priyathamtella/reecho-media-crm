package controllers

import (
	"encoding/json"
	"fmt"
	"reecho_media_crm/database"
	"reecho_media_crm/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// CreateBoard: Initializes a new board for the authenticated user (admin or member)
func CreateBoard(c *fiber.Ctx) error {
	adminIDStr, role, _ := getAdminContext(c)
	if role != "admin" && role != "member" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins or members can create boards"})
	}
	
	// Extract the real userID (for members this is their own UUID, not admin's)
	userIDStr, ok := c.Locals("userID").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	_ = adminIDStr // suppress unused warning
	userID, _ := uuid.Parse(userIDStr)

	var input struct {
		Title string `json:"title"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Create board object with proper OwnerID assignment
	board := models.Board{
		Title:     input.Title,
		OwnerID:   userID,
		FullState: json.RawMessage("{}"), // Initialize as empty JSON object
	}

	if err := database.DB.Create(&board).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not create board: " + err.Error()})
	}

	return c.Status(201).JSON(board)
}

// GetAllBoards: Fetches all boards the logged-in user can see (owned or shared)
func GetAllBoards(c *fiber.Ctx) error {
	adminIDStr, role, email := getAdminContext(c)
	adminID, _ := uuid.Parse(adminIDStr)
	realUserIDStr, ok := c.Locals("userID").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	realUserID, _ := uuid.Parse(realUserIDStr)

	var boards []models.Board
	seen := map[uuid.UUID]bool{}

	// 1. Owned boards
	var ownBoards []models.Board
	database.DB.Where("owner_id = ?", realUserID).Find(&ownBoards)
	for _, b := range ownBoards {
		boards = append(boards, b)
		seen[b.ID] = true
	}

	// 2. Shared boards via BoardAccess
	var sharedAccess []models.BoardAccess
	database.DB.Where("target_email = ?", email).Find(&sharedAccess)
	
	var sharedIDs []uuid.UUID
	for _, a := range sharedAccess {
		sharedIDs = append(sharedIDs, a.BoardID)
	}

	if len(sharedIDs) > 0 {
		var sharedBoards []models.Board
		database.DB.Where("id IN ?", sharedIDs).Find(&sharedBoards)
		for _, b := range sharedBoards {
			if !seen[b.ID] {
				boards = append(boards, b)
				seen[b.ID] = true
			}
		}
	}

	// 3. Client: boards already picked up via BoardAccess in step 2.
	// No extra loose client_name lookup — only explicit shares are shown.

	// 4. Assigned Task boards (for members)
	// NOTE: Admin-owned workspace boards are NOT automatically shown to members.
	// Members only see boards they own (step 1) or boards explicitly shared (step 2).
	if role == "member" {
		var member models.TeamMember
		if err := database.DB.Where("email = ?", email).First(&member).Error; err == nil {
			var taskBoardStrings []string
			database.DB.Model(&models.Task{}).
				Where("user_id = ? AND (assignees LIKE ? OR assignees LIKE ?) AND linked_board_id != ''",
					adminIDStr, "%"+member.Name+"%", "%"+member.Initials+"%").
				Pluck("linked_board_id", &taskBoardStrings)

			if len(taskBoardStrings) > 0 {
				var tIDs []uuid.UUID
				for _, s := range taskBoardStrings {
					if uid, err := uuid.Parse(s); err == nil { tIDs = append(tIDs, uid) }
				}
				if len(tIDs) > 0 {
					var tBoards []models.Board
					database.DB.Where("id IN ?", tIDs).Find(&tBoards)
					for _, b := range tBoards {
						if !seen[b.ID] {
							boards = append(boards, b)
							seen[b.ID] = true
						}
					}
				}
			}
			// Admin-owned boards are NOT added here. Members see only their own
			// boards and boards the admin explicitly shared with them.
		}
	}

	// 5. Admin pool view (Admins see everything owned by them OR their team members)
	if role == "admin" {
		var allWorkspaceBoards []models.Board
		// Find all boards where owner_id is admin OR where owner_id belongs to a member of this admin
		var memberIDs []uuid.UUID
		database.DB.Table("users").
			Select("users.id").
			Joins("inner join team_members on team_members.email = users.email").
			Where("team_members.user_id = ?", adminIDStr).
			Find(&memberIDs)
		
		query := database.DB.Where("owner_id = ?", adminID)
		if len(memberIDs) > 0 {
			query = database.DB.Where("owner_id = ? OR owner_id IN ?", adminID, memberIDs)
		}
		
		query.Find(&allWorkspaceBoards)
		for _, b := range allWorkspaceBoards {
			if !seen[b.ID] {
				boards = append(boards, b)
				seen[b.ID] = true
			}
		}
	}

	return c.JSON(boards)
}

// GetBoard: Fetches a single board (owner, shared, or client access)
func GetBoard(c *fiber.Ctx) error {
	adminIDStr, role, email := getAdminContext(c)
	boardID := c.Params("id")
	parsedBoardID, _ := uuid.Parse(boardID)

	var board models.Board
	permission := "viewer"

	// 1. Check Ownership
	userIDStr := c.Locals("userID").(string)
	userID, _ := uuid.Parse(userIDStr)
	if err := database.DB.Where("id = ? AND owner_id = ?", boardID, userID).First(&board).Error; err == nil {
		permission = "editor"
		return c.JSON(fiber.Map{
			"board":      board,
			"permission": permission,
		})
	}

	// 2. Check task assignment (if assigned to a task linked to this board, grant edit)
	if role == "member" {
		var member models.TeamMember
		database.DB.Where("email = ?", email).First(&member)
		var task models.Task
		// Search for any task linked to this board ID and assigned to this member
		err := database.DB.Where("user_id = ? AND (assignees LIKE ? OR assignees LIKE ?) AND linked_board_id = ?",
			adminIDStr, "%"+member.Name+"%", "%"+member.Initials+"%", boardID).First(&task).Error
		if err == nil {
			if err2 := database.DB.Where("id = ?", boardID).First(&board).Error; err2 == nil {
				permission = "editor"
				return c.JSON(fiber.Map{
					"board":      board,
					"permission": permission,
				})
			}
		}
	}

	// 3. Check if shared via BoardAccess
	var access models.BoardAccess
	err := database.DB.Where("board_id = ? AND target_email = ?", parsedBoardID, email).First(&access).Error
	if err == nil {
		if err2 := database.DB.Where("id = ?", boardID).First(&board).Error; err2 == nil {
			permission = access.Permission
			return c.JSON(fiber.Map{
				"board":      board,
				"permission": permission,
			})
		}
	}

	// Client access via client_name is removed — clients must only access boards
	// explicitly shared via the Share button (handled in step 3 above via BoardAccess).
	
	// 4. Admin fallback
	if role == "admin" {
		adminID, _ := uuid.Parse(adminIDStr)
		if err := database.DB.Where("id = ? AND owner_id = ?", boardID, adminID).First(&board).Error; err == nil {
			permission = "editor"
			return c.JSON(fiber.Map{
				"board":      board,
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
				if err := database.DB.Where("id = ? AND owner_id IN ?", boardID, memberIDs).First(&board).Error; err == nil {
					permission = "editor"
					return c.JSON(fiber.Map{
						"board":      board,
						"permission": permission,
					})
				}
			}
		}
	}

	return c.Status(404).JSON(fiber.Map{"error": "Board not found or no access"})
}

func SyncBoard(c *fiber.Ctx) error {
	id := c.Params("id")
	parsedBoardID, _ := uuid.Parse(id)
	adminIDStr, role, email := getAdminContext(c)

	type UpdatePayload struct {
		Title          string      `json:"title"`
		FullState      string      `json:"fullState"`
		ClientStatus   string      `json:"clientStatus"`
		ClientFeedback string      `json:"clientFeedback"`
		LinkedTaskID   interface{} `json:"linkedTaskId"`
		LinkedDocID    interface{} `json:"linkedDocId"`
	}

	var payload UpdatePayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON format"})
	}

	var board models.Board
	var canEdit bool = false

	// Check eligibility to edit
	realUserIDStr, _ := c.Locals("userID").(string)
	realUserID, _ := uuid.Parse(realUserIDStr)

	// Admin always can edit their pool (or any board if we want to be permissive, but let's stick to their pool)
	if role == "admin" {
		adminID, _ := uuid.Parse(adminIDStr)
		if err := database.DB.Where("id = ? AND owner_id = ?", id, adminID).First(&board).Error; err == nil {
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
				if err := database.DB.Where("id = ? AND owner_id IN ?", id, memberIDs).First(&board).Error; err == nil {
					canEdit = true
				}
			}
		}
	} else {
		// Owner can edit
		if err := database.DB.Where("id = ? AND owner_id = ?", id, realUserID).First(&board).Error; err == nil {
			canEdit = true
		} else {
			// Check shared access with "editor" permission
			var access models.BoardAccess
			if err2 := database.DB.Where("board_id = ? AND target_email = ? AND permission = 'editor'", parsedBoardID, email).First(&access).Error; err2 == nil {
				if err3 := database.DB.Where("id = ?", id).First(&board).Error; err3 == nil {
					canEdit = true
				}
			}
		}
	}

	// Client special case: can submit approval/feedback on boards explicitly shared with them (view-only access)
	if !canEdit && role == "client" {
		var access models.BoardAccess
		if err := database.DB.Where("board_id = ? AND target_email = ?", parsedBoardID, email).First(&access).Error; err == nil {
			// Clients with board access can update ClientStatus/Feedback only
			if err2 := database.DB.Where("id = ?", id).First(&board).Error; err2 == nil {
				if payload.ClientStatus != "" {
					board.ClientStatus = payload.ClientStatus
				}
				if payload.ClientFeedback != "" {
					board.ClientFeedback = payload.ClientFeedback
				}
				database.DB.Save(&board)
				return c.JSON(fiber.Map{"message": "Feedback saved", "board": board})
			}
		}
	}

	if !canEdit {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied or view-only mode"})
	}

	// Apply updates
	if payload.Title != "" {
		board.Title = payload.Title
	}
	if payload.FullState != "" {
		board.FullState = json.RawMessage(payload.FullState)
	}
	if role == "admin" || role == "member" {
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
			} else {
				bid, err := uuid.Parse(strID)
				if err == nil {
					board.LinkedDocID = &bid
				}
			}
		}
	}

	if err := database.DB.Save(&board).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save to database"})
	}

	return c.JSON(fiber.Map{"message": "Board synced successfully", "board": board})
}

// DeleteBoard: Permanently removes a board (only if the user owns it)
func DeleteBoard(c *fiber.Ctx) error {
	adminIDStr, role, _ := getAdminContext(c)
	realUserIDStr := c.Locals("userID").(string)
	realUserID, _ := uuid.Parse(realUserIDStr)
	boardID := c.Params("id")

	var board models.Board
	if err := database.DB.Where("id = ?", boardID).First(&board).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Board not found"})
	}

	canDelete := false
	if role == "admin" {
		adminID, _ := uuid.Parse(adminIDStr)
		// Admin can delete their own or their team members' boards
		if board.OwnerID == adminID {
			canDelete = true
		} else {
			// Check if owner is a member for this admin
			var memberCount int64
			database.DB.Table("team_members").
				Joins("inner join users on users.email = team_members.email").
				Where("team_members.user_id = ? AND users.id = ?", adminIDStr, board.OwnerID).
				Count(&memberCount)
			if memberCount > 0 {
				canDelete = true
			}
		}
	} else if board.OwnerID == realUserID {
		canDelete = true
	}

	if !canDelete {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "You don't have permission to delete this board"})
	}

	// 1. Delete associated access records
	database.DB.Where("board_id = ?", board.ID).Delete(&models.BoardAccess{})

	// 2. Delete the board
	if err := database.DB.Delete(&board).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete board"})
	}

	return c.JSON(fiber.Map{"message": "Board deleted successfully"})
}
