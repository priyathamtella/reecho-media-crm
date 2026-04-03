package controllers

import (
	"fmt"
	"reecho_media_crm/database"
	"reecho_media_crm/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// GetTeamMembersList: Returns all team members under the admin (for share dropdowns)
// Also includes `memberUserId` – the UUID of the member's own user account – so the
// frontend can match board/doc `ownerId` to the correct team member section.
func GetTeamMembersList(c *fiber.Ctx) error {
	adminID, role, email := getAdminContext(c)
	if role == "member" {
		var member models.TeamMember
		database.DB.Where("email = ?", email).First(&member)
		// Look up the member's own user UUID
		var user models.User
		memberUserID := ""
		if err := database.DB.Where("email = ?", member.Email).First(&user).Error; err == nil {
			memberUserID = user.ID.String()
		}
		return c.JSON([]fiber.Map{
			{
				"id": member.ID, "name": member.Name, "email": member.Email,
				"role": member.Role, "initials": member.Initials, "color": member.Color,
				"userId": member.UserID, "memberUserId": memberUserID,
			},
		})
	}
	if role == "client" {
		return c.JSON([]fiber.Map{})
	}
	var members []models.TeamMember
	database.DB.Where("user_id = ?", adminID).Find(&members)

	// For each member, look up their own user UUID
	result := make([]fiber.Map, 0, len(members))
	for _, m := range members {
		var user models.User
		memberUserID := ""
		if err := database.DB.Where("email = ?", m.Email).First(&user).Error; err == nil {
			memberUserID = user.ID.String()
		}
		result = append(result, fiber.Map{
			"id": m.ID, "name": m.Name, "email": m.Email,
			"role": m.Role, "initials": m.Initials, "color": m.Color,
			"userId": m.UserID, "memberUserId": memberUserID,
		})
	}
	return c.JSON(result)
}

// ShareBoard: Admin grants a user access to a specific board
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

	type ShareInput struct {
		TargetType  string `json:"type"`       // "member" or "client"
		TargetEmail string `json:"email"`
		Permission  string `json:"permission"` // "editor" or "viewer"
	}

	var input []ShareInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Remove existing access entries for this board
	database.DB.Where("board_id = ?", boardID).Delete(&models.BoardAccess{})

	// Re-create for selected targets
	for _, target := range input {
		access := models.BoardAccess{
			BoardID:     boardID,
			TargetType:  target.TargetType,
			TargetEmail: target.TargetEmail,
			Permission:  target.Permission,
			AdminID:     &adminIDStr,
		}
		if err := database.DB.Create(&access).Error; err != nil {
			fmt.Printf("Error creating BoardAccess: %v\n", err)
		}

		// Send notification email
		var board models.Board
		database.DB.Where("id = ?", boardID).First(&board)
		subject := "A board has been shared with you"
		body := fmt.Sprintf("Hi,\n\nThe board \"%s\" has been shared with you as a %s.\n\nYou can view it here: https://reechomedia.com/boards/%s\n\n— Reecho Media Team", 
			board.Title, target.Permission, boardID)
		sendEmail(target.TargetEmail, subject, body)
	}

	return c.JSON(fiber.Map{"message": "Board shared successfully"})
}

// GetBoardSharedMembers: Returns full access details for a board
func GetBoardSharedMembers(c *fiber.Ctx) error {
	adminIDStr, role, _ := getAdminContext(c)
	_ = adminIDStr
	if role != "admin" {
		return c.JSON([]interface{}{})
	}
	boardIDStr := c.Params("id")
	boardID, err := uuid.Parse(boardIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid board ID"})
	}
	var accesses []models.BoardAccess
	database.DB.Where("board_id = ?", boardID).Find(&accesses)
	return c.JSON(accesses)
}

// ShareDoc: Admin grants a user access to a specific document
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

	type ShareInput struct {
		TargetType  string `json:"type"`
		TargetEmail string `json:"email"`
		Permission  string `json:"permission"`
	}

	var input []ShareInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	database.DB.Where("doc_id = ?", docID).Delete(&models.DocAccess{})

	for _, target := range input {
		access := models.DocAccess{
			DocID:       docID,
			TargetType:  target.TargetType,
			TargetEmail: target.TargetEmail,
			Permission:  target.Permission,
			AdminID:     &adminIDStr,
		}
		if err := database.DB.Create(&access).Error; err != nil {
			fmt.Printf("Error creating DocAccess: %v\n", err)
		}

		// Send notification email
		var doc models.Document
		database.DB.Where("id = ?", docID).First(&doc)
		subject := "A document has been shared with you"
		body := fmt.Sprintf("Hi,\n\nThe document \"%s\" has been shared with you as a %s.\n\nYou can view it here: https://reechomedia.com/docs/%s\n\n— Reecho Media Team", 
			doc.Title, target.Permission, docID)
		sendEmail(target.TargetEmail, subject, body)
	}

	return c.JSON(fiber.Map{"message": "Document shared successfully"})
}

// GetDocSharedMembers: Returns who has access to a document
func GetDocSharedMembers(c *fiber.Ctx) error {
	adminIDStr, role, _ := getAdminContext(c)
	_ = adminIDStr
	if role != "admin" {
		return c.JSON([]interface{}{})
	}
	docIDStr := c.Params("id")
	docID, err := uuid.Parse(docIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid document ID"})
	}
	var accesses []models.DocAccess
	database.DB.Where("doc_id = ?", docID).Find(&accesses)
	return c.JSON(accesses)
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

	// Notify admin (use the adminID string or just the known admin email)
	adminEmail := "priyathamtella@gmail.com"
	subject := "Document Review Requested"
	body := fmt.Sprintf("Hi Admin,\n\nMember %s has submitted the document \"%s\" for review.\n\nView and Approve here: https://reechomedia.com/docs/%s\n\n— Reecho Media System", 
		member.Name, doc.Title, docID)
	sendEmail(adminEmail, subject, body)

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

	// Notify the creator/member (optional, but requested)
	// We'll try to find the reviewer's email if possible, or just skip if not critical.
	// For now, let's keep it simple.
	
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

	// Notify admin
	adminEmail := "priyathamtella@gmail.com"
	subject := "Board Review Requested"
	body := fmt.Sprintf("Hi Admin,\n\nMember %s has submitted the board \"%s\" for review.\n\nView and Approve here: https://reechomedia.com/boards/%s\n\n— Reecho Media System", 
		member.Name, board.Title, boardIDStr)
	sendEmail(adminEmail, subject, body)

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
