package controllers

import (
	"reecho_media_crm/database"
	"reecho_media_crm/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// GetTeamMembersList: Returns all team members under the admin (for share dropdowns)
func GetTeamMembersList(c *fiber.Ctx) error {
	adminID, role, email := getAdminContext(c)
	if role == "member" {
		// Members can see their own profile only
		var member models.TeamMember
		database.DB.Where("email = ?", email).First(&member)
		return c.JSON([]models.TeamMember{member})
	}
	if role == "client" {
		return c.JSON([]models.TeamMember{})
	}
	var members []models.TeamMember
	database.DB.Where("user_id = ?", adminID).Find(&members)
	return c.JSON(members)
}

// ShareBoard: Admin grants a team member access to a specific board
func ShareBoard(c *fiber.Ctx) error {
	adminIDStr, role, _ := getAdminContext(c)
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins can share boards"})
	}

	boardIDStr := c.Params("id")
	boardID, err := uuid.Parse(boardIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid board ID"})
	}

	var input struct {
		MemberIDs []uint `json:"memberIds"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Remove existing access entries for this board
	database.DB.Where("board_id = ? AND admin_id = ?", boardID, adminIDStr).Delete(&models.BoardAccess{})

	// Re-create for selected members
	for _, mid := range input.MemberIDs {
		access := models.BoardAccess{
			BoardID:  boardID,
			MemberID: mid,
			AdminID:  adminIDStr,
		}
		database.DB.Create(&access)
	}

	return c.JSON(fiber.Map{"message": "Board shared successfully"})
}

// GetBoardSharedMembers: Returns which member IDs have access to a board
func GetBoardSharedMembers(c *fiber.Ctx) error {
	adminIDStr, role, _ := getAdminContext(c)
	if role != "admin" {
		return c.JSON([]uint{})
	}
	boardIDStr := c.Params("id")
	boardID, err := uuid.Parse(boardIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid board ID"})
	}
	var accesses []models.BoardAccess
	database.DB.Where("board_id = ? AND admin_id = ?", boardID, adminIDStr).Find(&accesses)
	ids := make([]uint, len(accesses))
	for i, a := range accesses {
		ids[i] = a.MemberID
	}
	return c.JSON(ids)
}

// ShareDoc: Admin grants a team member access to a specific document
func ShareDoc(c *fiber.Ctx) error {
	adminIDStr, role, _ := getAdminContext(c)
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins can share documents"})
	}

	docIDStr := c.Params("id")
	docID, err := uuid.Parse(docIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid document ID"})
	}

	var input struct {
		MemberIDs []uint `json:"memberIds"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	database.DB.Where("doc_id = ? AND admin_id = ?", docID, adminIDStr).Delete(&models.DocAccess{})

	for _, mid := range input.MemberIDs {
		access := models.DocAccess{
			DocID:    docID,
			MemberID: mid,
			AdminID:  adminIDStr,
		}
		database.DB.Create(&access)
	}

	return c.JSON(fiber.Map{"message": "Document shared successfully"})
}

// GetDocSharedMembers: Returns which member IDs have access to a document
func GetDocSharedMembers(c *fiber.Ctx) error {
	adminIDStr, role, _ := getAdminContext(c)
	if role != "admin" {
		return c.JSON([]uint{})
	}
	docIDStr := c.Params("id")
	docID, err := uuid.Parse(docIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid document ID"})
	}
	var accesses []models.DocAccess
	database.DB.Where("doc_id = ? AND admin_id = ?", docID, adminIDStr).Find(&accesses)
	ids := make([]uint, len(accesses))
	for i, a := range accesses {
		ids[i] = a.MemberID
	}
	return c.JSON(ids)
}

// SubmitDocForReview: Member marks a document as ready for admin review
func SubmitDocForReview(c *fiber.Ctx) error {
	_, role, email := getAdminContext(c)
	if role != "member" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only members can submit for review"})
	}
	docIDStr := c.Params("id")
	docID, _ := uuid.Parse(docIDStr)

	// Get member name
	var member models.TeamMember
	database.DB.Where("email = ?", email).First(&member)

	// Find the doc (any owner, since member has shared access)
	var doc models.Document
	if err := database.DB.Where("id = ?", docID).First(&doc).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Document not found"})
	}
	doc.ReviewStatus = "in_review"
	doc.ReviewerName = member.Name
	database.DB.Save(&doc)
	return c.JSON(fiber.Map{"message": "Submitted for review"})
}

// ApproveDocReview: Admin marks a document review as approved
func ApproveDocReview(c *fiber.Ctx) error {
	_, role, _ := getAdminContext(c)
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins can approve"})
	}
	docIDStr := c.Params("id")
	var doc models.Document
	if err := database.DB.Where("id = ?", docIDStr).First(&doc).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Document not found"})
	}
	doc.ReviewStatus = "approved"
	database.DB.Save(&doc)
	return c.JSON(fiber.Map{"message": "Document approved"})
}

// SubmitBoardForReview: Member marks a board as ready for admin review
func SubmitBoardForReview(c *fiber.Ctx) error {
	_, role, email := getAdminContext(c)
	if role != "member" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only members can submit for review"})
	}
	boardIDStr := c.Params("id")

	var member models.TeamMember
	database.DB.Where("email = ?", email).First(&member)

	var board models.Board
	if err := database.DB.Where("id = ?", boardIDStr).First(&board).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Board not found"})
	}
	board.ReviewStatus = "in_review"
	board.ReviewerName = member.Name
	database.DB.Save(&board)
	return c.JSON(fiber.Map{"message": "Submitted for review"})
}

// ApproveBoardReview: Admin marks a board review as approved
func ApproveBoardReview(c *fiber.Ctx) error {
	_, role, _ := getAdminContext(c)
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins can approve"})
	}
	boardIDStr := c.Params("id")
	var board models.Board
	if err := database.DB.Where("id = ?", boardIDStr).First(&board).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Board not found"})
	}
	board.ReviewStatus = "approved"
	database.DB.Save(&board)
	return c.JSON(fiber.Map{"message": "Board approved"})
}
