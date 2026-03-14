package controllers

import (
	"encoding/json"
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

	var boards []models.Board
	if role == "client" {
		var client models.Client
		database.DB.Where("email = ?", email).First(&client)
		database.DB.Where("owner_id = ? AND client_name = ?", adminID, client.Name).Find(&boards)
	} else if role == "member" {
		// Member sees: own boards + boards shared with them by admin
		realUserIDStr, _ := c.Locals("userID").(string)
		realUserID, _ := uuid.Parse(realUserIDStr)

		// Get member's DB record (for shared access lookup)
		var member models.TeamMember
		database.DB.Where("email = ?", email).First(&member)

		// Get shared board IDs
		var accesses []models.BoardAccess
		database.DB.Where("member_id = ? AND admin_id = ?", member.ID, adminIDStr).Find(&accesses)
		sharedIDs := make([]uuid.UUID, len(accesses))
		for i, a := range accesses {
			sharedIDs[i] = a.BoardID
		}

		// Fetch own boards
		var ownBoards []models.Board
		database.DB.Where("owner_id = ?", realUserID).Find(&ownBoards)

		// Fetch shared boards (from admin's pool)
		var sharedBoards []models.Board
		if len(sharedIDs) > 0 {
			database.DB.Where("id IN ?", sharedIDs).Find(&sharedBoards)
		}

		// Merge (avoid duplicates)
		seen := map[uuid.UUID]bool{}
		for _, b := range ownBoards {
			if !seen[b.ID] {
				boards = append(boards, b)
				seen[b.ID] = true
			}
		}
		for _, b := range sharedBoards {
			if !seen[b.ID] {
				boards = append(boards, b)
				seen[b.ID] = true
			}
		}
	} else {
		if err := database.DB.Where("owner_id = ?", adminID).Find(&boards).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Could not fetch boards"})
		}
	}

	return c.JSON(boards)
}

// GetBoard: Fetches a single board (owner, admin-shared to member, or client access)
func GetBoard(c *fiber.Ctx) error {
	adminIDStr, role, email := getAdminContext(c)
	adminID, _ := uuid.Parse(adminIDStr)
	boardID := c.Params("id")

	var board models.Board

	if role == "client" {
		var client models.Client
		database.DB.Where("email = ?", email).First(&client)
		if err := database.DB.Where("id = ? AND owner_id = ? AND client_name = ?", boardID, adminID, client.Name).First(&board).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Board not found"})
		}
	} else if role == "member" {
		realUserIDStr, _ := c.Locals("userID").(string)
		realUserID, _ := uuid.Parse(realUserIDStr)
		parsedBoardID, _ := uuid.Parse(boardID)

		// Check if member owns it
		err := database.DB.Where("id = ? AND owner_id = ?", boardID, realUserID).First(&board).Error
		if err != nil {
			// Check shared access
			var member models.TeamMember
			database.DB.Where("email = ?", email).First(&member)
			var access models.BoardAccess
			if err2 := database.DB.Where("board_id = ? AND member_id = ?", parsedBoardID, member.ID).First(&access).Error; err2 != nil {
				return c.Status(404).JSON(fiber.Map{"error": "Board not found"})
			}
			if err3 := database.DB.Where("id = ?", boardID).First(&board).Error; err3 != nil {
				return c.Status(404).JSON(fiber.Map{"error": "Board not found"})
			}
		}
	} else {
		if err := database.DB.Where("id = ? AND owner_id = ?", boardID, adminID).First(&board).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Board not found"})
		}
	}

	return c.JSON(board)
}

func SyncBoard(c *fiber.Ctx) error {
	id := c.Params("id")
	adminIDStr, role, email := getAdminContext(c)
	adminID, _ := uuid.Parse(adminIDStr)

	type UpdatePayload struct {
		Title          string `json:"Title"`
		FullState      string `json:"FullState"`
		ClientStatus   string `json:"ClientStatus"`
		ClientFeedback string `json:"ClientFeedback"`
	}

	var payload UpdatePayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON format"})
	}

	var board models.Board
	if role == "client" {
		var client models.Client
		database.DB.Where("email = ?", email).First(&client)
		if err := database.DB.Where("id = ? AND owner_id = ? AND client_name = ?", id, adminID, client.Name).First(&board).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Board not found"})
		}
		if payload.ClientStatus != "" {
			board.ClientStatus = payload.ClientStatus
		}
		if payload.ClientFeedback != "" {
			board.ClientFeedback = payload.ClientFeedback
		}
	} else if role == "member" {
		parsedBoardID, _ := uuid.Parse(id)
		realUserIDStr, _ := c.Locals("userID").(string)
		realUserID, _ := uuid.Parse(realUserIDStr)

		// Check ownership or shared access
		err := database.DB.Where("id = ? AND owner_id = ?", id, realUserID).First(&board).Error
		if err != nil {
			var member models.TeamMember
			database.DB.Where("email = ?", email).First(&member)
			var access models.BoardAccess
			if err2 := database.DB.Where("board_id = ? AND member_id = ?", parsedBoardID, member.ID).First(&access).Error; err2 != nil {
				return c.Status(404).JSON(fiber.Map{"error": "Board not found or no access"})
			}
			if err3 := database.DB.Where("id = ?", id).First(&board).Error; err3 != nil {
				return c.Status(404).JSON(fiber.Map{"error": "Board not found"})
			}
		}
		// Members can update full state and title
		if payload.Title != "" {
			board.Title = payload.Title
		}
		if payload.FullState != "" {
			board.FullState = json.RawMessage(payload.FullState)
		}
	} else {
		if err := database.DB.Where("id = ? AND owner_id = ?", id, adminID).First(&board).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Board not found"})
		}
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
	}

	if err := database.DB.Save(&board).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save to database"})
	}

	return c.JSON(fiber.Map{"message": "Board synced successfully", "board": board})
}

// DeleteBoard: Permanently removes a board (only if the user owns it)
func DeleteBoard(c *fiber.Ctx) error {
	userIDStr := c.Locals("userID").(string)
	userID, _ := uuid.Parse(userIDStr)
	boardID := c.Params("id")

	var board models.Board
	if err := database.DB.Where("id = ? AND owner_id = ?", boardID, userID).First(&board).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Board not found or you don't own it"})
	}

	if err := database.DB.Delete(&board).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete board"})
	}

	return c.JSON(fiber.Map{"message": "Board deleted successfully"})
}
