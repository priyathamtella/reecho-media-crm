package controllers

import (
	"encoding/json"
	"reecho_media_crm/database"
	"reecho_media_crm/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// CreateBoard: Initializes a new board for the authenticated user
func CreateBoard(c *fiber.Ctx) error {
	_, role, _ := getAdminContext(c)
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins can create boards"})
	}
	
	// Extract userID from middleware
	userIDStr, ok := c.Locals("userID").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
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

// GetAllBoards: Fetches all boards belonging to the logged-in user
func GetAllBoards(c *fiber.Ctx) error {
	adminIDStr, role, email := getAdminContext(c)
	adminID, _ := uuid.Parse(adminIDStr)

	var boards []models.Board
	if role == "client" {
		var client models.Client
		database.DB.Where("email = ?", email).First(&client)
		database.DB.Where("owner_id = ? AND client_name = ?", adminID, client.Name).Find(&boards)
	} else {
		if err := database.DB.Where("owner_id = ?", adminID).Find(&boards).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Could not fetch boards"})
		}
	}

	return c.JSON(boards)
}

// GetBoard: Fetches a single board and returns FullState as a JSON object
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
		// Client only updates feedback and status
		if payload.ClientStatus != "" {
			board.ClientStatus = payload.ClientStatus
		}
		if payload.ClientFeedback != "" {
			board.ClientFeedback = payload.ClientFeedback
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
