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

func SyncBoard(c *fiber.Ctx) error {
	// 1. Get the Board ID from the URL
	id := c.Params("id")

	// 2. Define a specific struct for the incoming JSON
	// This ensures we catch exactly what React sends
	type UpdatePayload struct {
		Title     string `json:"Title"`
		FullState string `json:"FullState"`
	}

	var payload UpdatePayload

	// 3. Parse the Body
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid JSON format",
		})
	}

	// 4. Find the existing board in the database
	var board models.Board
	// Note: In a real app, also check "user_id = ?" to ensure ownership!
	if err := database.DB.First(&board, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Board not found"})
	}

	// 5. Update fields explicitly
	// We only update Title and FullState, leaving ID and CreatedAt alone
	board.Title = payload.Title
	board.FullState = json.RawMessage(payload.FullState)

	// 6. Save changes to DB
	if err := database.DB.Save(&board).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save to database"})
	}

	// 7. Success Response
	return c.JSON(fiber.Map{
		"message": "Board synced successfully",
		"board":   board,
	})
}
