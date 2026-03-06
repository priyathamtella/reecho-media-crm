package controllers

import (
	"reecho_media_crm/database"
	"reecho_media_crm/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// CreateDocument: Create a new rich-text document
func CreateDocument(c *fiber.Ctx) error {
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

// GetAllDocuments: List all documents for the authenticated user
func GetAllDocuments(c *fiber.Ctx) error {
	userIDStr, ok := c.Locals("userID").(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	userID, _ := uuid.Parse(userIDStr)

	var docs []models.Document
	if err := database.DB.Where("owner_id = ?", userID).Order("updated_at desc").Find(&docs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not fetch documents"})
	}
	return c.JSON(docs)
}

// GetDocument: Get a single document by ID
func GetDocument(c *fiber.Ctx) error {
	userIDStr := c.Locals("userID").(string)
	userID, _ := uuid.Parse(userIDStr)
	docID := c.Params("id")

	var doc models.Document
	if err := database.DB.Where("id = ? AND owner_id = ?", docID, userID).First(&doc).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Document not found"})
	}
	return c.JSON(doc)
}

// UpdateDocument: Save document content + title
func UpdateDocument(c *fiber.Ctx) error {
	userIDStr := c.Locals("userID").(string)
	userID, _ := uuid.Parse(userIDStr)
	docID := c.Params("id")

	var doc models.Document
	if err := database.DB.Where("id = ? AND owner_id = ?", docID, userID).First(&doc).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Document not found"})
	}

	type UpdatePayload struct {
		Title         string  `json:"title"`
		Content       string  `json:"content"`
		LinkedBoardID *string `json:"linkedBoardId"`
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

// GetDocumentsByBoard: Get all documents linked to a specific board
func GetDocumentsByBoard(c *fiber.Ctx) error {
	userIDStr := c.Locals("userID").(string)
	userID, _ := uuid.Parse(userIDStr)
	boardID := c.Params("boardId")

	var docs []models.Document
	if err := database.DB.Where("linked_board_id = ? AND owner_id = ?", boardID, userID).Find(&docs).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not fetch documents"})
	}
	return c.JSON(docs)
}
