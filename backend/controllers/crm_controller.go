package controllers

import (
	"fmt"
	"net/smtp"
	"os"
	"reecho_media_crm/database"
	"reecho_media_crm/models"

	"github.com/gofiber/fiber/v2"
)

// sendEmail is a generic helper that sends an email via SMTP
func sendEmail(toEmail, subject, body string) {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	fromEmail := os.Getenv("SMTP_EMAIL")
	fromPass := os.Getenv("SMTP_PASSWORD")
	if smtpHost == "" || fromEmail == "" || fromPass == "" {
		fmt.Println("[Email] SMTP not configured — skipping email")
		return
	}
	// Use display name 'Reecho Media'
	msg := fmt.Sprintf("From: Reecho Media <%s>\r\nTo: %s\r\nSubject: %s\r\nMIME-version: 1.0\r\nContent-Type: text/plain; charset=\"UTF-8\"\r\n\r\n%s",
		fromEmail, toEmail, subject, body)
	auth := smtp.PlainAuth("", fromEmail, fromPass, smtpHost)
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, fromEmail, []string{toEmail}, []byte(msg))
	if err != nil {
		fmt.Printf("[Email] Failed: %v\n", err)
	} else {
		fmt.Printf("[Email] Sent to %s\n", toEmail)
	}
}

// sendInviteEmail sends a team member invitation email
func sendInviteEmail(toEmail, toName, role string) {
	subject := "You've been invited to join Reecho Media CRM"
	body := fmt.Sprintf(`Hi %s,

You have been invited to join the Reecho Media team as a %s.

Please contact your admin for your login credentials.

Welcome aboard!

— Reecho Media Team`, toName, role)
	sendEmail(toEmail, subject, body)
}

// sendClientWelcomeEmail sends a congratulations email to a new client
func sendClientWelcomeEmail(toEmail, clientName, pkg string) {
	subject := fmt.Sprintf("🎉 Welcome to Reecho Media, %s!", clientName)
	body := fmt.Sprintf(`Hi %s,

Congratulations — you are now officially teamed up with Reecho Media!

We're thrilled to partner with you on your digital marketing journey.

Your package: %s

Our team will be in touch shortly to kick things off. In the meantime, feel free to reach out with any questions.

Here's to great work together! 🚀

— Reecho Media Team
tejeswar.raju357@gmail.com`, clientName, pkg)
	sendEmail(toEmail, subject, body)
}

// Helper: extract userID string from JWT locals
func getUserID(c *fiber.Ctx) string {
	raw := c.Locals("userID")
	if raw == nil {
		return ""
	}
	return fmt.Sprintf("%v", raw)
}

// --- CLIENTS ---
func GetClients(c *fiber.Ctx) error {
	userID := getUserID(c)
	var clients []models.Client
	database.DB.Where("user_id = ?", userID).Find(&clients)
	return c.JSON(clients)
}

func CreateClient(c *fiber.Ctx) error {
	client := new(models.Client)
	if err := c.BodyParser(client); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}
	client.UserID = getUserID(c)
	database.DB.Create(&client)
	// Send welcome email to client if email provided
	if client.Email != "" {
		go sendClientWelcomeEmail(client.Email, client.Name, client.Package)
	}
	return c.JSON(client)
}

func DeleteClient(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := getUserID(c)
	database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Client{})
	return c.JSON(fiber.Map{"message": "Client deleted"})
}

// --- TASKS ---
func GetTasks(c *fiber.Ctx) error {
	userID := getUserID(c)
	var tasks []models.Task
	database.DB.Where("user_id = ?", userID).Find(&tasks)
	return c.JSON(tasks)
}

func CreateTask(c *fiber.Ctx) error {
	task := new(models.Task)
	if err := c.BodyParser(task); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}
	task.UserID = getUserID(c)
	database.DB.Create(&task)
	return c.JSON(task)
}

func UpdateTask(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := getUserID(c)
	var task models.Task
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&task).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Task not found"})
	}
	if err := c.BodyParser(&task); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}
	task.UserID = userID // Prevent overriding
	database.DB.Save(&task)
	return c.JSON(task)
}

func DeleteTask(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := getUserID(c)
	database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Task{})
	return c.JSON(fiber.Map{"message": "Task deleted"})
}

// --- INVOICES ---
func GetInvoices(c *fiber.Ctx) error {
	userID := getUserID(c)
	var invoices []models.Invoice
	database.DB.Where("user_id = ?", userID).Find(&invoices)
	return c.JSON(invoices)
}

func CreateInvoice(c *fiber.Ctx) error {
	inv := new(models.Invoice)
	if err := c.BodyParser(inv); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}
	inv.UserID = getUserID(c)
	database.DB.Create(&inv)
	return c.JSON(inv)
}

// --- TEAM MEMBERS ---
func GetTeamMembers(c *fiber.Ctx) error {
	userID := getUserID(c)
	var members []models.TeamMember
	database.DB.Where("user_id = ?", userID).Find(&members)
	return c.JSON(members)
}

func CreateTeamMember(c *fiber.Ctx) error {
	member := new(models.TeamMember)
	if err := c.BodyParser(member); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}
	member.UserID = getUserID(c)
	database.DB.Create(&member)
	// Send invite email in background (non-blocking)
	if member.Email != "" {
		go sendInviteEmail(member.Email, member.Name, member.Role)
	}
	return c.JSON(member)
}

func DeleteTeamMember(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := getUserID(c)
	database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.TeamMember{})
	return c.JSON(fiber.Map{"message": "Team member removed"})
}

func UpdateTeamMember(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := getUserID(c)
	var member models.TeamMember
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&member).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Member not found"})
	}
	if err := c.BodyParser(&member); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}
	database.DB.Save(&member)
	return c.JSON(member)
}

// --- CALENDAR EVENTS ---
func GetCalendarEvents(c *fiber.Ctx) error {
	userID := getUserID(c)
	var events []models.CalendarEvent
	database.DB.Where("user_id = ?", userID).Find(&events)
	return c.JSON(events)
}

func CreateCalendarEvent(c *fiber.Ctx) error {
	event := new(models.CalendarEvent)
	if err := c.BodyParser(event); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}
	event.UserID = getUserID(c)
	database.DB.Create(&event)
	return c.JSON(event)
}

func DeleteCalendarEvent(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := getUserID(c)
	database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.CalendarEvent{})
	return c.JSON(fiber.Map{"message": "Event deleted"})
}

// --- CONTACT FORM ---
type ContactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Details string `json:"details"`
}

func ContactUs(c *fiber.Ctx) error {
	var req ContactRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	subject := fmt.Sprintf("New Project Inquiry from %s", req.Name)
	body := fmt.Sprintf("You have received a new contact submission layout:\n\nName: %s\nEmail: %s\nProject Details:\n%s\n", req.Name, req.Email, req.Details)

	sendEmail("priyathamtella@gmail.com", subject, body)
	
	return c.JSON(fiber.Map{"message": "Inquiry sent successfully"})
}
