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
	userIDStr, ok := c.Locals("userID").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, _ := uuid.Parse(userIDStr)

	var boards []models.Board
	if err := database.DB.Where("owner_id = ?", userID).Find(&boards).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not fetch boards"})
	}

	return c.JSON(boards)
}

// GetBoard: Fetches a single board and returns FullState as a JSON object
func GetBoard(c *fiber.Ctx) error {
	userIDStr := c.Locals("userID").(string)
	userID, _ := uuid.Parse(userIDStr)
	boardID := c.Params("id")

	var board models.Board
	if err := database.DB.Where("id = ? AND owner_id = ?", boardID, userID).First(&board).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Board not found"})
	}

	return c.JSON(board)
}

// SyncBoard: Updates board edits and drag-and-drop state
func SyncBoard(c *fiber.Ctx) error {
	userIDStr := c.Locals("userID").(string)
	userID, _ := uuid.Parse(userIDStr)
	boardID := c.Params("id")

	// Use json.RawMessage to capture the object without base64 issues
	var input struct {
		Title     string          `json:"title"`
		FullState json.RawMessage `json:"fullState"`
		Zoom      float64         `json:"zoom"`
		PanX      float64         `json:"panX"`
		PanY      float64         `json:"panY"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid data format"})
	}

	// Update using a map to force string conversion for PostgreSQL JSONB
	result := database.DB.Model(&models.Board{}).
		Where("id = ? AND owner_id = ?", boardID, userID).
		Updates(map[string]interface{}{
			"title":      input.Title,
			"full_state": string(input.FullState), // Fixes SQLSTATE 22P02
			"zoom":       input.Zoom,
			"pan_x":      input.PanX,
			"pan_y":      input.PanY,
		})

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Update failed"})
	}

	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "No board found to update"})
	}

	return c.JSON(fiber.Map{"message": "Sync successful"})
}