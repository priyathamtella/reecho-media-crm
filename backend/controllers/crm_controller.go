package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/smtp"
	"os"
	"reecho_media_crm/database"
	"reecho_media_crm/models"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

func generateRandomPassword() string {
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		return "DefaultPass123!" // Fallback
	}
	return hex.EncodeToString(bytes)
}

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
func sendInviteEmail(toEmail, toName, role, password string) {
	subject := "You've been invited to join Reecho Media CRM"
	body := fmt.Sprintf(`Hi %s,

You have been invited to join the Reecho Media team as a %s.

You can now log in to the portal.
Email: %s
Password: %s
Login Portal: http://localhost:5173/login

Welcome aboard!

— Reecho Media Team`, toName, role, toEmail, password)
	sendEmail(toEmail, subject, body)
}

// sendClientWelcomeEmail sends a congratulations email to a new client
func sendClientWelcomeEmail(toEmail, clientName, pkg, password string) {
	subject := fmt.Sprintf("🎉 Welcome to Reecho Media, %s!", clientName)
	body := fmt.Sprintf(`Hi %s,

Congratulations — you are now officially teamed up with Reecho Media!

We've set up a dedicated Client Hub for you to track progress.
Email: %s
Password: %s
Login Portal: http://localhost:5173/login

Your package: %s

Our team will be in touch shortly to kick things off.

Here's to great work together! 🚀

— Reecho Media Team`, clientName, toEmail, password, pkg)
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

// Helper: get context for role-based scoping
func getAdminContext(c *fiber.Ctx) (string, string, string) {
	userID := getUserID(c)
	roleRaw := c.Locals("role")
	role := "admin"
	if roleRaw != nil {
		role = fmt.Sprintf("%v", roleRaw)
	}
	emailRaw := c.Locals("email")
	email := ""
	if emailRaw != nil {
		email = fmt.Sprintf("%v", emailRaw)
	}

	fmt.Printf("[Debug] Context - UserID: %s, Role: %s, Email: %s\n", userID, role, email)

	if userID == "" || email == "" {
		return userID, role, email
	}

	if role == "client" {
		var client models.Client
		if err := database.DB.Where("email = ?", email).First(&client).Error; err == nil {
			fmt.Printf("[Debug] Client Role - Parent UserID: %s\n", client.UserID)
			return client.UserID, role, email
		} else {
			fmt.Printf("[Debug] Client lookup failed for email: %s, Error: %v\n", email, err)
		}
	} else if role == "member" {
		var member models.TeamMember
		if err := database.DB.Where("email = ?", email).First(&member).Error; err == nil {
			fmt.Printf("[Debug] Member Role - Parent UserID: %s\n", member.UserID)
			return member.UserID, role, email
		} else {
			fmt.Printf("[Debug] Member lookup failed for email: %s, Error: %v\n", email, err)
		}
	}
	return userID, role, email
}

// --- CLIENTS ---
func GetClients(c *fiber.Ctx) error {
	adminID, role, email := getAdminContext(c)
	var clients []models.Client
	
	if role == "client" {
		database.DB.Where("email = ?", email).Find(&clients)
	} else if role == "member" {
		// Filter clients that have tasks assigned to this member
		var member models.TeamMember
		database.DB.Where("email = ?", email).First(&member)
		
		var clientNames []string
		database.DB.Model(&models.Task{}).
			Where("user_id = ? AND (assignees LIKE ? OR assignees LIKE ?)", 
				adminID, "%"+member.Name+"%", "%"+member.Initials+"%").
			Distinct("client").
			Pluck("client", &clientNames)
		
		database.DB.Where("user_id = ? AND name IN ?", adminID, clientNames).Find(&clients)
	} else {
		// Admin sees all clients
		database.DB.Where("user_id = ?", adminID).Find(&clients)
	}
	return c.JSON(clients)
}

func CreateClient(c *fiber.Ctx) error {
	client := new(models.Client)
	if err := c.BodyParser(client); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}
	adminID, _, _ := getAdminContext(c)
	client.UserID = adminID
	if err := database.DB.Create(&client).Error; err != nil {
		fmt.Printf("[Debug] Failed to create client: %v\n", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create client in database"})
	}
	fmt.Printf("[Debug] Client created: %s (ID: %d)\n", client.Name, client.ID)
	
	// Default random pass
	password := generateRandomPassword()
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), 10)
	
	// Send welcome email to client if email provided
	if client.Email != "" {
		// Create login user for client
		user := models.User{
			Name:     client.Name,
			Email:    client.Email,
			Password: string(hashedPassword),
			Role:     "client",
		}
		// If email is not unique, this might fail, but we ignore the error for now as it's best effort
		database.DB.Create(&user)

		go sendClientWelcomeEmail(client.Email, client.Name, client.Package, password)
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
	adminID, role, email := getAdminContext(c)
	var tasks []models.Task
	
	if role == "client" {
		var client models.Client
		if err := database.DB.Where("email = ?", email).First(&client).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Client profile not found"})
		}
		// Clients see all tasks for their own name
		database.DB.Where("user_id = ? AND client = ?", adminID, client.Name).Find(&tasks)
	} else if role == "member" {
		var member models.TeamMember
		if err := database.DB.Where("email = ?", email).First(&member).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Member profile not found"})
		}
		// Match by name or initials in the comma-separated assignees string
		database.DB.Where("user_id = ? AND (assignees LIKE ? OR assignees LIKE ?)", 
			adminID, "%"+member.Name+"%", "%"+member.Initials+"%").Find(&tasks)
	} else {
		database.DB.Where("user_id = ?", adminID).Find(&tasks)
	}
	
	return c.JSON(tasks)
}

func CreateTask(c *fiber.Ctx) error {
	_, role, _ := getAdminContext(c)
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins can create tasks"})
	}

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
	adminID, role, email := getAdminContext(c)
	
	var task models.Task
	if err := database.DB.Where("id = ? AND user_id = ?", id, adminID).First(&task).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Task not found"})
	}

	if role == "member" {
		// Verify if assigned to this member
		var member models.TeamMember
		database.DB.Where("email = ?", email).First(&member)
		
		isAssigned := false
		if task.Assignees != "" {
			for _, a := range models.SplitAssignees(task.Assignees) {
				if a == member.Name || a == member.Initials {
					isAssigned = true
					break
				}
			}
		}

		if !isAssigned {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied"})
		}

		// Members can only update Status
		type StatusUpdate struct {
			Status string `json:"status"`
		}
		var su StatusUpdate
		if err := c.BodyParser(&su); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
		}
		
		// Restriction: Members can only move to "To Do" or "In Progress" or "In Review"
		if su.Status != "To Do" && su.Status != "In Progress" && su.Status != "In Review" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Members can only set status to 'To Do', 'In Progress', or 'In Review'."})
		}
		
		// If moving to In Review, notify admin
		if su.Status == "In Review" && task.Status != "In Review" {
			subject := fmt.Sprintf("🧐 Task Review Request: %s", task.Title)
			body := fmt.Sprintf("Hey Admin,\n\nTeam member %s has completed a task and requested a review:\n\n📌 Task: %s\n🏢 Client: %s\n\nPlease login to the CRM to approve and mark as Done.\n\n— Reecho Media CRM Auto-Notify", member.Name, task.Title, task.Client)
			// Assuming admin email is known or fetched. For now using a placeholder or common admin email.
			go sendEmail("priyathamtella@gmail.com", subject, body)
		}
		
		task.Status = su.Status
		database.DB.Save(&task)
		return c.JSON(task)
	}

	if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Admins only"})
	}

	if err := c.BodyParser(&task); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}
	task.UserID = adminID // Prevent overriding
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
	adminID, role, email := getAdminContext(c)
	var invoices []models.Invoice
	
	if role == "client" {
		var client models.Client
		database.DB.Where("email = ?", email).First(&client)
		// Clients see 'client' type invoices addressed to them
		database.DB.Where("user_id = ? AND client = ? AND type = ?", adminID, client.Name, "client").Find(&invoices)
	} else if role == "member" {
		// Members see their own 'payout' requests
		database.DB.Where("user_id = ? AND sender = ? AND type = ?", adminID, email, "payout").Find(&invoices)
	} else {
		// Admin sees all invoices
		database.DB.Where("user_id = ?", adminID).Find(&invoices)
	}
	
	return c.JSON(invoices)
}

func CreateInvoice(c *fiber.Ctx) error {
	adminID, role, email := getAdminContext(c)
	inv := new(models.Invoice)
	if err := c.BodyParser(inv); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}
	
	inv.UserID = adminID
	inv.Sender = email
	
	if role == "member" {
		inv.Type = "payout"
		inv.Status = "Pending" // Payouts start as pending
		// For payouts, 'Client' field stores the member's name
		var member models.TeamMember
		database.DB.Where("email = ?", email).First(&member)
		inv.Client = member.Name
	} else if role == "admin" {
		if inv.Type == "" {
			inv.Type = "client"
		}
	} else {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins and members can raise invoices"})
	}

	database.DB.Create(&inv)
	return c.JSON(inv)
}

func UpdateInvoice(c *fiber.Ctx) error {
	id := c.Params("id")
	adminID, role, email := getAdminContext(c)
	
	var inv models.Invoice
	if err := database.DB.Where("id = ? AND user_id = ?", id, adminID).First(&inv).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Invoice not found"})
	}

	// Roles logic:
	// Clients can only update status to 'Paid' (accept and pay logic)
	// Members cannot update invoices they didn't create (and they only update to 'Cancelled' maybe)
	// Admin can update everything
	
	type UpdatePayload struct {
		Status        string `json:"status"`
		DeclineReason string `json:"decline_reason"`
	}
	var up UpdatePayload
	if err := c.BodyParser(&up); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	if role == "client" {
		if inv.Type == "client" && (up.Status == "Paid" || up.Status == "Declined") {
			inv.Status = up.Status
			if up.Status == "Declined" {
				inv.DeclineReason = up.DeclineReason
			}
		} else {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Clients can only mark invoices as Paid or Declined"})
		}
	} else if role == "member" {
		if inv.Sender == email && up.Status == "Cancelled" {
			inv.Status = "Cancelled"
		} else {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Members can only cancel their own payout requests"})
		}
	} else {
		// Admin
		if up.Status != "" {
			inv.Status = up.Status
		}
		if up.DeclineReason != "" {
			inv.DeclineReason = up.DeclineReason
		}
	}

	database.DB.Save(&inv)
	return c.JSON(inv)
}

// --- TEAM MEMBERS ---
func GetTeamMembers(c *fiber.Ctx) error {
	adminID, role, email := getAdminContext(c)
	var members []models.TeamMember
	
	if role == "client" {
		return c.JSON([]models.TeamMember{})
	} else if role == "member" {
		database.DB.Where("email = ?", email).Find(&members)
	} else {
		database.DB.Where("user_id = ?", adminID).Find(&members)
	}
	
	return c.JSON(members)
}

func CreateTeamMember(c *fiber.Ctx) error {
	member := new(models.TeamMember)
	if err := c.BodyParser(member); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}
	adminID, _, _ := getAdminContext(c)
	member.UserID = adminID
	if err := database.DB.Create(&member).Error; err != nil {
		fmt.Printf("[Debug] Failed to create team member: %v\n", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create team member in database"})
	}
	fmt.Printf("[Debug] Team member created: %s (ID: %d)\n", member.Name, member.ID)
	
	password := generateRandomPassword()
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), 10)

	// Send invite email in background (non-blocking)
	if member.Email != "" {
		// Create login user for member
		user := models.User{
			Name:     member.Name,
			Email:    member.Email,
			Password: string(hashedPassword),
			Role:     "member",
		}
		database.DB.Create(&user)

		go sendInviteEmail(member.Email, member.Name, member.Role, password)
	}
	return c.JSON(member)
}

func DeleteTeamMember(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := getUserID(c)
	
	var member models.TeamMember
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&member).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Member not found"})
	}

	// Delete user first
	database.DB.Where("email = ?", member.Email).Delete(&models.User{})
	// Then delete member
	database.DB.Delete(&member)
	
	return c.JSON(fiber.Map{"message": "Team member removed and credentials invalidated"})
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
	adminID, role, email := getAdminContext(c)
	var events []models.CalendarEvent
	
	if role == "client" {
		var client models.Client
		database.DB.Where("email = ?", email).First(&client)
		database.DB.Where("user_id = ? AND client = ?", adminID, client.Name).Find(&events)
	} else if role == "member" {
		// Members see all workspace events (view only)
		database.DB.Where("user_id = ?", adminID).Find(&events)
	} else {
		database.DB.Where("user_id = ?", adminID).Find(&events)
	}
	
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
	Name               string `json:"name"`
	Email              string `json:"email"`
	ContactNo          string `json:"contactNo"`
	ServicesLookingFor string `json:"servicesLookingFor"`
	CompanyName        string `json:"companyName"`
	CompanyWebsite     string `json:"companyWebsite"`
	Details            string `json:"details"`
}

func ContactUs(c *fiber.Ctx) error {
	var req ContactRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	subject := fmt.Sprintf("🚀 New Project Inquiry from %s! Let's build something epic.", req.Name)
	body := fmt.Sprintf("Hey Team Reecho,\n\nWe just received a fresh inquiry from an exciting new lead! Here are all the details to get the ball rolling:\n\n✨ The Visionary: %s\n📧 Email Address: %s\n📱 Contact No: %s\n\n💼 Company: %s\n🌐 Website: %s\n\n🎯 Services Desired: %s\n\n💬 Their Ideas & Message:\n\"%s\"\n\nLet's reach out and create some magic! 🔥", 
		req.Name, req.Email, req.ContactNo, req.CompanyName, req.CompanyWebsite, req.ServicesLookingFor, req.Details)

	sendEmail("priyathamtella@gmail.com", subject, body)
	
	return c.JSON(fiber.Map{"message": "Inquiry sent successfully"})
}
