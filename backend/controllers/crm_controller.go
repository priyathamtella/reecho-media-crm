package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/smtp"
	"os"
	"strings"

	"reecho_media_crm/database"
	"reecho_media_crm/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

func randomPassword() string {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		return "DefaultPass123!"
	}
	return hex.EncodeToString(b)
}

func sendEmail(to, subject, body string) {
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	from := os.Getenv("SMTP_EMAIL")
	pass := os.Getenv("SMTP_PASSWORD")
	if host == "" || from == "" || pass == "" {
		fmt.Println("[Email] SMTP not configured — skipping")
		return
	}
	msg := fmt.Sprintf(
		"From: Reecho Media <%s>\r\nTo: %s\r\nSubject: %s\r\nMIME-version: 1.0\r\nContent-Type: text/plain; charset=\"UTF-8\"\r\n\r\n%s",
		from, to, subject, body,
	)
	err := smtp.SendMail(host+":"+port, smtp.PlainAuth("", from, pass, host), from, []string{to}, []byte(msg))
	if err != nil {
		fmt.Printf("[Email] Failed to send to %s: %v\n", to, err)
	}
}

func notifyEmail() string {
	if e := os.Getenv("ADMIN_NOTIFY_EMAIL"); e != "" {
		return e
	}
	return os.Getenv("SMTP_EMAIL")
}

// getUserIDStr extracts the raw userID string from the JWT context.
func getUserIDStr(c *fiber.Ctx) string {
	if raw := c.Locals("userID"); raw != nil {
		return fmt.Sprintf("%v", raw)
	}
	return ""
}

// getAdminContext returns (adminUserID, role, email).
// For clients and members it resolves their parent admin's user_id so every
// query can use a single owner scope.
func getAdminContext(c *fiber.Ctx) (adminID, role, email string) {
	rawID := c.Locals("userID")
	rawRole := c.Locals("role")
	rawEmail := c.Locals("email")

	adminID = fmt.Sprintf("%v", rawID)
	role = "admin"
	if rawRole != nil {
		role = fmt.Sprintf("%v", rawRole)
	}
	email = ""
	if rawEmail != nil {
		email = fmt.Sprintf("%v", rawEmail)
	}

	switch role {
	case "client":
		var client models.Client
		if err := database.DB.Get(&client, "SELECT * FROM clients WHERE email = $1 AND deleted_at IS NULL LIMIT 1", email); err == nil {
			adminID = client.UserID
		}
	case "member":
		var member models.TeamMember
		if err := database.DB.Get(&member, "SELECT * FROM team_members WHERE email = $1 AND deleted_at IS NULL LIMIT 1", email); err == nil {
			adminID = member.UserID
		}
	}
	return
}

// ─── CLIENTS ──────────────────────────────────────────────────────────────────

func GetClients(c *fiber.Ctx) error {
	adminID, role, email := getAdminContext(c)
	var clients []models.Client

	switch role {
	case "client":
		database.DB.Select(&clients,
			"SELECT * FROM clients WHERE email = $1 AND deleted_at IS NULL", email)
	case "member":
		var clientNames []string
		database.DB.Select(&clientNames,
			"SELECT DISTINCT client FROM tasks WHERE user_id = $1 AND (assignees LIKE $2 OR assignees LIKE $3) AND deleted_at IS NULL",
			adminID, "%"+email+"%", "%"+email+"%")
		if len(clientNames) > 0 {
			query, args, _ := buildIN("SELECT * FROM clients WHERE user_id = ? AND name IN (?) AND deleted_at IS NULL", adminID, clientNames)
			database.DB.Select(&clients, query, args...)
		}
	default:
		database.DB.Select(&clients,
			"SELECT * FROM clients WHERE user_id = $1 AND deleted_at IS NULL", adminID)
	}
	return c.JSON(clients)
}

func CreateClient(c *fiber.Ctx) error {
	adminID, _, _ := getAdminContext(c)

	var input models.Client
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	input.UserID = adminID

	var id uint
	err := database.DB.QueryRow(
		`INSERT INTO clients (user_id, name, email, industry, package, status, monthly_value, initials, color)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
		input.UserID, input.Name, input.Email, input.Industry, input.Package,
		input.Status, input.MonthlyValue, input.Initials, input.Color,
	).Scan(&id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create client"})
	}
	input.ID = id

	if input.Email != "" {
		pw := randomPassword()
		hashed, _ := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
		database.DB.Exec(
			"INSERT INTO users (id, name, email, password, role) VALUES ($1,$2,$3,$4,'client') ON CONFLICT (email) DO NOTHING",
			uuid.New(), input.Name, input.Email, string(hashed),
		)
		go sendClientWelcomeEmail(input.Email, input.Name, input.Package, pw)
	}
	return c.Status(fiber.StatusCreated).JSON(input)
}

func sendClientWelcomeEmail(to, name, pkg, pw string) {
	subject := fmt.Sprintf("🎉 Welcome to Reecho Media, %s!", name)
	body := fmt.Sprintf(`Hi %s,

Congratulations — you're now officially teamed up with Reecho Media!

Your client portal credentials:
Email: %s
Password: %s
Login: https://reechomedia.com/login

Package: %s

Our team will be in touch shortly. Here's to great work together! 🚀

— Reecho Media Team`, name, to, pw, pkg)
	sendEmail(to, subject, body)
}

func DeleteClient(c *fiber.Ctx) error {
	id := c.Params("id")
	adminID := getUserIDStr(c)
	database.DB.Exec(
		"UPDATE clients SET deleted_at = NOW() WHERE id = $1 AND user_id = $2", id, adminID)
	return c.JSON(fiber.Map{"message": "Client deleted"})
}

// ─── TASKS ────────────────────────────────────────────────────────────────────

func GetTasks(c *fiber.Ctx) error {
	adminID, role, email := getAdminContext(c)
	var tasks []models.Task

	switch role {
	case "client":
		var client models.Client
		if err := database.DB.Get(&client, "SELECT * FROM clients WHERE email = $1 AND deleted_at IS NULL LIMIT 1", email); err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Client profile not found"})
		}
		database.DB.Select(&tasks,
			"SELECT * FROM tasks WHERE user_id = $1 AND client = $2 AND deleted_at IS NULL", adminID, client.Name)
	case "member":
		var member models.TeamMember
		if err := database.DB.Get(&member, "SELECT * FROM team_members WHERE email = $1 AND deleted_at IS NULL LIMIT 1", email); err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Member profile not found"})
		}
		database.DB.Select(&tasks,
			"SELECT * FROM tasks WHERE user_id = $1 AND (assignees LIKE $2 OR assignees LIKE $3) AND deleted_at IS NULL",
			adminID, "%"+member.Name+"%", "%"+member.Initials+"%")
	default:
		database.DB.Select(&tasks,
			"SELECT * FROM tasks WHERE user_id = $1 AND deleted_at IS NULL", adminID)
	}
	return c.JSON(tasks)
}

func CreateTask(c *fiber.Ctx) error {
	adminID, role, _ := getAdminContext(c)
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins can create tasks"})
	}
	var input models.Task
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	var id uint
	err := database.DB.QueryRow(
		`INSERT INTO tasks (user_id, client, title, tag, status, due_date, assignees, linked_board_id, linked_doc_id)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
		adminID, input.Client, input.Title, input.Tag, input.Status,
		input.DueDate, input.Assignees, input.LinkedBoardID, input.LinkedDocID,
	).Scan(&id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create task"})
	}
	input.ID = id
	input.UserID = adminID
	return c.Status(fiber.StatusCreated).JSON(input)
}

func UpdateTask(c *fiber.Ctx) error {
	id := c.Params("id")
	adminID, role, email := getAdminContext(c)

	var task models.Task
	if err := database.DB.Get(&task, "SELECT * FROM tasks WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL", id, adminID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Task not found"})
	}

	if role == "member" {
		var member models.TeamMember
		database.DB.Get(&member, "SELECT * FROM team_members WHERE email = $1 AND deleted_at IS NULL LIMIT 1", email)

		assigned := false
		for _, a := range models.SplitAssignees(task.Assignees) {
			if a == member.Name || a == member.Initials {
				assigned = true
				break
			}
		}
		if !assigned {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied"})
		}

		var mu struct {
			Status        string `json:"status"`
			LinkedBoardID string `json:"linkedBoardId"`
			LinkedDocID   string `json:"linkedDocId"`
		}
		if err := c.BodyParser(&mu); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
		}
		allowed := map[string]bool{"To Do": true, "In Progress": true, "In Review": true}
		if mu.Status != "" && !allowed[mu.Status] {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Members can only set status to 'To Do', 'In Progress', or 'In Review'"})
		}
		if mu.Status == "In Review" && task.Status != "In Review" {
			go sendEmail(notifyEmail(),
				fmt.Sprintf("🧐 Task Review Request: %s", task.Title),
				fmt.Sprintf("Hey Admin,\n\n%s has completed a task and requested a review:\n\n📌 Task: %s\n🏢 Client: %s\n\n— Reecho Media CRM", member.Name, task.Title, task.Client),
			)
		}
		if mu.Status != "" {
			task.Status = mu.Status
		}
		if mu.LinkedBoardID != "" {
			task.LinkedBoardID = mu.LinkedBoardID
		}
		if mu.LinkedDocID != "" {
			task.LinkedDocID = mu.LinkedDocID
		}
		database.DB.Exec(
			"UPDATE tasks SET status=$1, linked_board_id=$2, linked_doc_id=$3, updated_at=NOW() WHERE id=$4",
			task.Status, task.LinkedBoardID, task.LinkedDocID, task.ID,
		)
		return c.JSON(task)
	}

	if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Admins only"})
	}

	var input models.Task
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	database.DB.Exec(
		`UPDATE tasks SET client=$1, title=$2, tag=$3, status=$4, due_date=$5, assignees=$6,
		 linked_board_id=$7, linked_doc_id=$8, updated_at=NOW() WHERE id=$9`,
		input.Client, input.Title, input.Tag, input.Status, input.DueDate,
		input.Assignees, input.LinkedBoardID, input.LinkedDocID, id,
	)
	input.ID = task.ID
	input.UserID = adminID
	return c.JSON(input)
}

func DeleteTask(c *fiber.Ctx) error {
	id := c.Params("id")
	adminID := getUserIDStr(c)
	database.DB.Exec("UPDATE tasks SET deleted_at = NOW() WHERE id = $1 AND user_id = $2", id, adminID)
	return c.JSON(fiber.Map{"message": "Task deleted"})
}

// ─── INVOICES ─────────────────────────────────────────────────────────────────

func GetInvoices(c *fiber.Ctx) error {
	adminID, role, email := getAdminContext(c)
	var invoices []models.Invoice

	switch role {
	case "client":
		var client models.Client
		database.DB.Get(&client, "SELECT * FROM clients WHERE email = $1 AND deleted_at IS NULL LIMIT 1", email)
		database.DB.Select(&invoices,
			"SELECT * FROM invoices WHERE user_id = $1 AND client = $2 AND type = 'client' AND deleted_at IS NULL",
			adminID, client.Name)
	case "member":
		database.DB.Select(&invoices,
			"SELECT * FROM invoices WHERE user_id = $1 AND sender = $2 AND type = 'payout' AND deleted_at IS NULL",
			adminID, email)
	default:
		database.DB.Select(&invoices,
			"SELECT * FROM invoices WHERE user_id = $1 AND deleted_at IS NULL", adminID)
	}
	return c.JSON(invoices)
}

func CreateInvoice(c *fiber.Ctx) error {
	adminID, role, email := getAdminContext(c)

	var input models.Invoice
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	input.UserID = adminID
	input.Sender = email

	switch role {
	case "member":
		var member models.TeamMember
		database.DB.Get(&member, "SELECT * FROM team_members WHERE email = $1 AND deleted_at IS NULL LIMIT 1", email)
		input.Type = "payout"
		input.Status = "Pending"
		input.Client = member.Name
	case "admin":
		if input.Type == "" {
			input.Type = "client"
		}
	default:
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admins and members can raise invoices"})
	}

	var id uint
	err := database.DB.QueryRow(
		`INSERT INTO invoices (user_id, invoice_id, client, service, amount, date, status, type, sender, decline_reason)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
		input.UserID, input.InvoiceID, input.Client, input.Service, input.Amount,
		input.Date, input.Status, input.Type, input.Sender, input.DeclineReason,
	).Scan(&id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create invoice"})
	}
	input.ID = id
	return c.Status(fiber.StatusCreated).JSON(input)
}

func UpdateInvoice(c *fiber.Ctx) error {
	id := c.Params("id")
	adminID, role, email := getAdminContext(c)

	var inv models.Invoice
	if err := database.DB.Get(&inv, "SELECT * FROM invoices WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL", id, adminID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Invoice not found"})
	}

	var payload struct {
		Status        string `json:"status"`
		DeclineReason string `json:"declineReason"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	switch role {
	case "client":
		if inv.Type != "client" || (payload.Status != "Paid" && payload.Status != "Declined") {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Clients can only mark invoices as Paid or Declined"})
		}
		inv.Status = payload.Status
		if payload.Status == "Declined" {
			inv.DeclineReason = payload.DeclineReason
		}
	case "member":
		if inv.Sender != email || payload.Status != "Cancelled" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Members can only cancel their own payout requests"})
		}
		inv.Status = "Cancelled"
	default: // admin
		if payload.Status != "" {
			inv.Status = payload.Status
		}
		if payload.DeclineReason != "" {
			inv.DeclineReason = payload.DeclineReason
		}
	}

	database.DB.Exec(
		"UPDATE invoices SET status=$1, decline_reason=$2, updated_at=NOW() WHERE id=$3",
		inv.Status, inv.DeclineReason, inv.ID,
	)
	return c.JSON(inv)
}

// ─── TEAM MEMBERS ─────────────────────────────────────────────────────────────

func GetTeamMembers(c *fiber.Ctx) error {
	adminID, role, email := getAdminContext(c)
	var members []models.TeamMember

	switch role {
	case "client":
		return c.JSON([]models.TeamMember{})
	case "member":
		database.DB.Select(&members, "SELECT * FROM team_members WHERE email = $1 AND deleted_at IS NULL", email)
	default:
		database.DB.Select(&members, "SELECT * FROM team_members WHERE user_id = $1 AND deleted_at IS NULL", adminID)
	}
	return c.JSON(members)
}

func CreateTeamMember(c *fiber.Ctx) error {
	adminID, _, _ := getAdminContext(c)

	var input models.TeamMember
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	input.UserID = adminID

	var id uint
	err := database.DB.QueryRow(
		`INSERT INTO team_members (user_id, name, email, role, initials, color, tasks_num, tasks_done, clients_num, progress, working_on)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
		input.UserID, input.Name, input.Email, input.Role, input.Initials, input.Color,
		input.TasksNum, input.TasksDone, input.ClientsNum, input.Progress, input.WorkingOn,
	).Scan(&id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create team member"})
	}
	input.ID = id

	if input.Email != "" {
		pw := randomPassword()
		hashed, _ := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
		database.DB.Exec(
			"INSERT INTO users (id, name, email, password, role) VALUES ($1,$2,$3,$4,'member') ON CONFLICT (email) DO NOTHING",
			uuid.New(), input.Name, input.Email, string(hashed),
		)
		go sendInviteEmail(input.Email, input.Name, input.Role, pw)
	}
	return c.Status(fiber.StatusCreated).JSON(input)
}

func sendInviteEmail(to, name, role, pw string) {
	subject := "You've been invited to join Reecho Media CRM"
	body := fmt.Sprintf(`Hi %s,

You've been invited to join Reecho Media as a %s.

Your login credentials:
Email: %s
Password: %s
Login: https://reechomedia.com/login

Welcome aboard!

— Reecho Media Team`, name, role, to, pw)
	sendEmail(to, subject, body)
}

func UpdateTeamMember(c *fiber.Ctx) error {
	id := c.Params("id")
	adminID := getUserIDStr(c)

	var member models.TeamMember
	if err := database.DB.Get(&member, "SELECT * FROM team_members WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL", id, adminID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Member not found"})
	}
	oldEmail := member.Email

	var input struct {
		Name       string `json:"name"`
		Email      string `json:"email"`
		Role       string `json:"role"`
		WorkingOn  string `json:"workingOn"`
		Color      string `json:"color"`
		ClientsNum int    `json:"clientsNum"`
		Password   string `json:"password"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	initials := ""
	if len(input.Name) >= 2 {
		initials = strings.ToUpper(input.Name[:2])
	}

	database.DB.Exec(
		`UPDATE team_members SET name=$1, email=$2, role=$3, working_on=$4, color=$5, clients_num=$6, initials=$7, updated_at=NOW() WHERE id=$8`,
		input.Name, input.Email, input.Role, input.WorkingOn, input.Color, input.ClientsNum, initials, id,
	)

	// Sync user record
	if input.Password != "" {
		hashed, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		database.DB.Exec("UPDATE users SET name=$1, email=$2, password=$3 WHERE email=$4", input.Name, input.Email, string(hashed), oldEmail)
	} else {
		database.DB.Exec("UPDATE users SET name=$1, email=$2 WHERE email=$3", input.Name, input.Email, oldEmail)
	}

	member.Name = input.Name
	member.Email = input.Email
	member.Role = input.Role
	member.WorkingOn = input.WorkingOn
	member.Color = input.Color
	member.ClientsNum = input.ClientsNum
	member.Initials = initials
	return c.JSON(member)
}

func DeleteTeamMember(c *fiber.Ctx) error {
	id := c.Params("id")
	adminID := getUserIDStr(c)

	var member models.TeamMember
	if err := database.DB.Get(&member, "SELECT * FROM team_members WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL", id, adminID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Member not found"})
	}

	// Clean up owned boards & docs, access grants, payout requests, calendar events
	database.DB.Exec("DELETE FROM board_accesses WHERE target_email = $1", member.Email)
	database.DB.Exec("DELETE FROM doc_accesses  WHERE target_email = $1", member.Email)
	database.DB.Exec("UPDATE invoices SET deleted_at=NOW() WHERE type='payout' AND sender=$1", member.Email)

	// Remove from task assignees
	var tasks []models.Task
	database.DB.Select(&tasks,
		"SELECT * FROM tasks WHERE (assignees LIKE $1 OR assignees LIKE $2) AND deleted_at IS NULL",
		"%"+member.Name+"%", "%"+member.Initials+"%")
	for _, t := range tasks {
		parts := models.SplitAssignees(t.Assignees)
		var updated []string
		for _, p := range parts {
			if p != member.Name && p != member.Initials {
				updated = append(updated, p)
			}
		}
		database.DB.Exec("UPDATE tasks SET assignees=$1, updated_at=NOW() WHERE id=$2", strings.Join(updated, ","), t.ID)
	}

	// Delete user login & soft-delete member record
	database.DB.Exec("DELETE FROM users WHERE email = $1", member.Email)
	database.DB.Exec("UPDATE team_members SET deleted_at=NOW() WHERE id=$1", id)

	return c.JSON(fiber.Map{"message": "Team member deleted"})
}

// ─── CALENDAR EVENTS ──────────────────────────────────────────────────────────

func GetCalendarEvents(c *fiber.Ctx) error {
	adminID, role, email := getAdminContext(c)
	var events []models.CalendarEvent

	switch role {
	case "client":
		var client models.Client
		if err := database.DB.Get(&client, "SELECT * FROM clients WHERE email = $1 AND deleted_at IS NULL LIMIT 1", email); err == nil {
			database.DB.Select(&events,
				"SELECT * FROM calendar_events WHERE user_id = $1 AND client = $2 AND deleted_at IS NULL",
				adminID, client.Name)
		}
	case "member":
		var member models.TeamMember
		database.DB.Get(&member, "SELECT * FROM team_members WHERE email = $1 AND deleted_at IS NULL LIMIT 1", email)
		var clientNames []string
		database.DB.Select(&clientNames,
			"SELECT DISTINCT client FROM tasks WHERE user_id = $1 AND (assignees LIKE $2 OR assignees LIKE $3) AND deleted_at IS NULL",
			adminID, "%"+member.Name+"%", "%"+member.Initials+"%")
		if len(clientNames) > 0 {
			query, args, _ := buildIN("SELECT * FROM calendar_events WHERE user_id = ? AND client IN (?) AND deleted_at IS NULL", adminID, clientNames)
			database.DB.Select(&events, query, args...)
		}
	default:
		database.DB.Select(&events,
			"SELECT * FROM calendar_events WHERE user_id = $1 AND deleted_at IS NULL", adminID)
	}
	return c.JSON(events)
}

func CreateCalendarEvent(c *fiber.Ctx) error {
	userID := getUserIDStr(c)

	var input models.CalendarEvent
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}
	input.UserID = userID

	var id uint
	err := database.DB.QueryRow(
		`INSERT INTO calendar_events (user_id, title, client, platform, date, color) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
		input.UserID, input.Title, input.Client, input.Platform, input.Date, input.Color,
	).Scan(&id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create event"})
	}
	input.ID = id
	return c.Status(fiber.StatusCreated).JSON(input)
}

func DeleteCalendarEvent(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := getUserIDStr(c)
	database.DB.Exec("UPDATE calendar_events SET deleted_at=NOW() WHERE id=$1 AND user_id=$2", id, userID)
	return c.JSON(fiber.Map{"message": "Event deleted"})
}

// ─── CONTACT FORM ─────────────────────────────────────────────────────────────

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
	subject := fmt.Sprintf("🚀 New Project Inquiry from %s!", req.Name)
	body := fmt.Sprintf(`Hey Team Reecho,

New inquiry received:

✨ Name: %s
📧 Email: %s
📱 Contact: %s
💼 Company: %s
🌐 Website: %s
🎯 Services: %s

💬 Message:
"%s"

— Reecho Media CRM Auto-Notify`, req.Name, req.Email, req.ContactNo, req.CompanyName, req.CompanyWebsite, req.ServicesLookingFor, req.Details)
	sendEmail(notifyEmail(), subject, body)
	return c.JSON(fiber.Map{"message": "Inquiry sent successfully"})
}

// ─── UTILITY ──────────────────────────────────────────────────────────────────

// buildIN wraps sqlx.In and rebinds for Postgres $N syntax.
func buildIN(query string, args ...interface{}) (string, []interface{}, error) {
	q, a, err := sqlx.In(query, args...)
	if err != nil {
		return query, args, err
	}
	return database.DB.Rebind(q), a, nil
}
