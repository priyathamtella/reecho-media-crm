package controllers

import (
	"fmt"

	"reecho_media_crm/database"
	"reecho_media_crm/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// ─── GetTeamMembersList ────────────────────────────────────────────────────────
// Returns all team members under the admin (used for share dropdowns).
// Also includes memberUserId so the frontend can match board/doc ownerId.

func GetTeamMembersList(c *fiber.Ctx) error {
	adminID, role, email := getAdminContext(c)

	if role == "member" {
		var member models.TeamMember
		database.DB.Get(&member, "SELECT * FROM team_members WHERE email = $1 AND deleted_at IS NULL LIMIT 1", email)
		var user models.User
		memberUserID := ""
		if err := database.DB.Get(&user, "SELECT * FROM users WHERE email = $1 LIMIT 1", member.Email); err == nil {
			memberUserID = user.ID.String()
		}
		return c.JSON([]fiber.Map{{
			"id": member.ID, "name": member.Name, "email": member.Email,
			"role": member.Role, "initials": member.Initials, "color": member.Color,
			"userId": member.UserID, "memberUserId": memberUserID,
		}})
	}
	if role == "client" {
		return c.JSON([]fiber.Map{})
	}

	var members []models.TeamMember
	database.DB.Select(&members, "SELECT * FROM team_members WHERE user_id = $1 AND deleted_at IS NULL", adminID)

	result := make([]fiber.Map, 0, len(members))
	for _, m := range members {
		var user models.User
		memberUserID := ""
		if err := database.DB.Get(&user, "SELECT * FROM users WHERE email = $1 LIMIT 1", m.Email); err == nil {
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

// ─── ShareBoard ────────────────────────────────────────────────────────────────

func ShareBoard(c *fiber.Ctx) error {
	adminIDStr, role, _ := getAdminContext(c)
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins can share boards"})
	}

	boardIDStr := c.Params("id")
	boardID, err := uuid.Parse(boardIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid board ID"})
	}

	type ShareInput struct {
		TargetType  string `json:"type"`
		TargetEmail string `json:"email"`
		Permission  string `json:"permission"`
	}
	var inputs []ShareInput
	if err := c.BodyParser(&inputs); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Replace all existing access for this board
	database.DB.Exec("DELETE FROM board_accesses WHERE board_id = $1", boardID)

	for _, inp := range inputs {
		database.DB.Exec(
			"INSERT INTO board_accesses (board_id, target_type, target_email, permission, admin_id) VALUES ($1,$2,$3,$4,$5)",
			boardID, inp.TargetType, inp.TargetEmail, inp.Permission, adminIDStr,
		)

		// Notify the user
		var board models.Board
		database.DB.Get(&board, "SELECT * FROM boards WHERE id = $1 LIMIT 1", boardID)
		go sendEmail(inp.TargetEmail,
			"A board has been shared with you",
			fmt.Sprintf("Hi,\n\nThe board \"%s\" has been shared with you as a %s.\n\nView it here: https://reechomedia.com/boards/%s\n\n— Reecho Media Team",
				board.Title, inp.Permission, boardIDStr),
		)
	}
	return c.JSON(fiber.Map{"message": "Board shared successfully"})
}

// ─── GetBoardSharedMembers ─────────────────────────────────────────────────────

func GetBoardSharedMembers(c *fiber.Ctx) error {
	_, role, _ := getAdminContext(c)
	if role != "admin" {
		return c.JSON([]interface{}{})
	}
	boardIDStr := c.Params("id")
	boardID, err := uuid.Parse(boardIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid board ID"})
	}
	var accesses []models.BoardAccess
	database.DB.Select(&accesses, "SELECT * FROM board_accesses WHERE board_id = $1", boardID)
	return c.JSON(accesses)
}

// ─── ShareDoc ─────────────────────────────────────────────────────────────────

func ShareDoc(c *fiber.Ctx) error {
	adminIDStr, role, _ := getAdminContext(c)
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins can share documents"})
	}

	docIDStr := c.Params("id")
	docID, err := uuid.Parse(docIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid document ID"})
	}

	type ShareInput struct {
		TargetType  string `json:"type"`
		TargetEmail string `json:"email"`
		Permission  string `json:"permission"`
	}
	var inputs []ShareInput
	if err := c.BodyParser(&inputs); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	database.DB.Exec("DELETE FROM doc_accesses WHERE doc_id = $1", docID)

	for _, inp := range inputs {
		database.DB.Exec(
			"INSERT INTO doc_accesses (doc_id, target_type, target_email, permission, admin_id) VALUES ($1,$2,$3,$4,$5)",
			docID, inp.TargetType, inp.TargetEmail, inp.Permission, adminIDStr,
		)

		var doc models.Document
		database.DB.Get(&doc, "SELECT * FROM documents WHERE id = $1 LIMIT 1", docID)
		go sendEmail(inp.TargetEmail,
			"A document has been shared with you",
			fmt.Sprintf("Hi,\n\nThe document \"%s\" has been shared with you as a %s.\n\nView it here: https://reechomedia.com/docs/%s\n\n— Reecho Media Team",
				doc.Title, inp.Permission, docIDStr),
		)
	}
	return c.JSON(fiber.Map{"message": "Document shared successfully"})
}

// ─── GetDocSharedMembers ──────────────────────────────────────────────────────

func GetDocSharedMembers(c *fiber.Ctx) error {
	_, role, _ := getAdminContext(c)
	if role != "admin" {
		return c.JSON([]interface{}{})
	}
	docIDStr := c.Params("id")
	docID, err := uuid.Parse(docIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid document ID"})
	}
	var accesses []models.DocAccess
	database.DB.Select(&accesses, "SELECT * FROM doc_accesses WHERE doc_id = $1", docID)
	return c.JSON(accesses)
}

// ─── SubmitDocForReview ───────────────────────────────────────────────────────

func SubmitDocForReview(c *fiber.Ctx) error {
	_, role, email := getAdminContext(c)
	if role != "member" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only members can submit for review"})
	}
	docIDStr := c.Params("id")
	docID, _ := uuid.Parse(docIDStr)

	var member models.TeamMember
	database.DB.Get(&member, "SELECT * FROM team_members WHERE email = $1 AND deleted_at IS NULL LIMIT 1", email)

	var doc models.Document
	if err := database.DB.Get(&doc, "SELECT * FROM documents WHERE id = $1 LIMIT 1", docID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Document not found"})
	}

	database.DB.Exec(
		"UPDATE documents SET review_status='in_review', reviewer_name=$1, updated_at=NOW() WHERE id=$2",
		member.Name, docID,
	)

	go sendEmail(notifyEmail(),
		fmt.Sprintf("Document Review Requested: %s", doc.Title),
		fmt.Sprintf("Hi Admin,\n\n%s has submitted \"%s\" for review.\n\nApprove here: https://reechomedia.com/docs/%s\n\n— Reecho Media CRM",
			member.Name, doc.Title, docIDStr),
	)
	return c.JSON(fiber.Map{"message": "Submitted for review"})
}

// ─── ApproveDocReview ─────────────────────────────────────────────────────────

func ApproveDocReview(c *fiber.Ctx) error {
	_, role, _ := getAdminContext(c)
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins can approve"})
	}
	docIDStr := c.Params("id")
	docID, _ := uuid.Parse(docIDStr)

	var doc models.Document
	if err := database.DB.Get(&doc, "SELECT * FROM documents WHERE id = $1 LIMIT 1", docID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Document not found"})
	}

	database.DB.Exec("UPDATE documents SET review_status='approved', updated_at=NOW() WHERE id=$1", docID)
	return c.JSON(fiber.Map{"message": "Document approved"})
}

// ─── SubmitBoardForReview ─────────────────────────────────────────────────────

func SubmitBoardForReview(c *fiber.Ctx) error {
	_, role, email := getAdminContext(c)
	if role != "member" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only members can submit for review"})
	}
	boardIDStr := c.Params("id")
	boardID, _ := uuid.Parse(boardIDStr)

	var member models.TeamMember
	database.DB.Get(&member, "SELECT * FROM team_members WHERE email = $1 AND deleted_at IS NULL LIMIT 1", email)

	var board models.Board
	if err := database.DB.Get(&board, "SELECT * FROM boards WHERE id = $1 LIMIT 1", boardID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Board not found"})
	}

	database.DB.Exec(
		"UPDATE boards SET review_status='in_review', reviewer_name=$1, updated_at=NOW() WHERE id=$2",
		member.Name, boardID,
	)

	go sendEmail(notifyEmail(),
		fmt.Sprintf("Board Review Requested: %s", board.Title),
		fmt.Sprintf("Hi Admin,\n\n%s has submitted \"%s\" for review.\n\nApprove here: https://reechomedia.com/boards/%s\n\n— Reecho Media CRM",
			member.Name, board.Title, boardIDStr),
	)
	return c.JSON(fiber.Map{"message": "Submitted for review"})
}

// ─── ApproveBoardReview ───────────────────────────────────────────────────────

func ApproveBoardReview(c *fiber.Ctx) error {
	_, role, _ := getAdminContext(c)
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins can approve"})
	}
	boardIDStr := c.Params("id")
	boardID, _ := uuid.Parse(boardIDStr)

	var board models.Board
	if err := database.DB.Get(&board, "SELECT * FROM boards WHERE id = $1 LIMIT 1", boardID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Board not found"})
	}

	database.DB.Exec("UPDATE boards SET review_status='approved', updated_at=NOW() WHERE id=$1", boardID)
	return c.JSON(fiber.Map{"message": "Board approved"})
}
