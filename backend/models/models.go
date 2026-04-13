package models

import (
	"strings"
	"time"

	"github.com/google/uuid"
)

// User is a platform account (admin, member, or client login).
type User struct {
	ID        uuid.UUID `db:"id"         json:"id"`
	Name      string    `db:"name"       json:"name"`
	Email     string    `db:"email"      json:"email"`
	Password  string    `db:"password"   json:"-"`
	Role      string    `db:"role"       json:"role"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
}

// Board is a visual whiteboard owned by one user.
type Board struct {
	ID             uuid.UUID  `db:"id"              json:"id"`
	Title          string     `db:"title"           json:"title"`
	OwnerID        uuid.UUID  `db:"owner_id"        json:"ownerId"`
	FullState      []byte     `db:"full_state"      json:"fullState"`
	Zoom           float64    `db:"zoom"            json:"zoom"`
	PanX           float64    `db:"pan_x"           json:"panX"`
	PanY           float64    `db:"pan_y"           json:"panY"`
	ClientName     string     `db:"client_name"     json:"clientName"`
	ClientStatus   string     `db:"client_status"   json:"clientStatus"`
	ClientFeedback string     `db:"client_feedback" json:"clientFeedback"`
	LinkedTaskID   uint       `db:"linked_task_id"  json:"linkedTaskId"`
	LinkedDocID    *uuid.UUID `db:"linked_doc_id"   json:"linkedDocId"`
	ReviewStatus   string     `db:"review_status"   json:"reviewStatus"`
	ReviewerName   string     `db:"reviewer_name"   json:"reviewerName"`
	CreatedAt      time.Time  `db:"created_at"      json:"createdAt"`
	UpdatedAt      time.Time  `db:"updated_at"      json:"updatedAt"`
}

// Document is a rich-text note linked to boards or tasks.
type Document struct {
	ID             uuid.UUID  `db:"id"              json:"id"`
	Title          string     `db:"title"           json:"title"`
	Content        string     `db:"content"         json:"content"`
	OwnerID        uuid.UUID  `db:"owner_id"        json:"ownerId"`
	LinkedBoardID  *uuid.UUID `db:"linked_board_id" json:"linkedBoardId"`
	LinkedTaskID   uint       `db:"linked_task_id"  json:"linkedTaskId"`
	ReviewStatus   string     `db:"review_status"   json:"reviewStatus"`
	ReviewerName   string     `db:"reviewer_name"   json:"reviewerName"`
	CreatedAt      time.Time  `db:"created_at"      json:"createdAt"`
	UpdatedAt      time.Time  `db:"updated_at"      json:"updatedAt"`
}

// Client is a business client managed by an admin.
type Client struct {
	ID           uint       `db:"id"            json:"id"`
	UserID       string     `db:"user_id"       json:"userId"`
	Name         string     `db:"name"          json:"name"`
	Email        string     `db:"email"         json:"email"`
	Industry     string     `db:"industry"      json:"industry"`
	Package      string     `db:"package"       json:"package"`
	Status       string     `db:"status"        json:"status"`
	MonthlyValue int        `db:"monthly_value"  json:"monthlyValue"`
	Initials     string     `db:"initials"      json:"initials"`
	Color        string     `db:"color"         json:"color"`
	CreatedAt    time.Time  `db:"created_at"    json:"createdAt"`
	UpdatedAt    time.Time  `db:"updated_at"    json:"updatedAt"`
	DeletedAt    *time.Time `db:"deleted_at"    json:"deletedAt,omitempty"`
}

// Task is a work item assigned to team members.
type Task struct {
	ID             uint       `db:"id"               json:"ID"`
	UserID         string     `db:"user_id"          json:"userId"`
	Client         string     `db:"client"           json:"client"`
	Title          string     `db:"title"            json:"title"`
	Tag            string     `db:"tag"              json:"tag"`
	Status         string     `db:"status"           json:"status"`
	DueDate        string     `db:"due_date"         json:"dueDate"`
	Assignees      string     `db:"assignees"        json:"assignees"`
	LinkedBoardID  string     `db:"linked_board_id"  json:"linkedBoardId"`
	LinkedDocID    string     `db:"linked_doc_id"    json:"linkedDocId"`
	CreatedAt      time.Time  `db:"created_at"       json:"createdAt"`
	UpdatedAt      time.Time  `db:"updated_at"       json:"updatedAt"`
	DeletedAt      *time.Time `db:"deleted_at"       json:"deletedAt,omitempty"`
}

// SplitAssignees splits the comma-separated assignees string.
func SplitAssignees(s string) []string {
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if t := strings.TrimSpace(p); t != "" {
			out = append(out, t)
		}
	}
	return out
}

// Invoice is either a client billing record or a member payout request.
type Invoice struct {
	ID            uint       `db:"id"             json:"ID"`
	UserID        string     `db:"user_id"        json:"userId"`
	InvoiceID     string     `db:"invoice_id"     json:"invoiceId"`
	Client        string     `db:"client"         json:"client"`
	Service       string     `db:"service"        json:"service"`
	Amount        int        `db:"amount"         json:"amount"`
	Date          string     `db:"date"           json:"date"`
	Status        string     `db:"status"         json:"status"`
	Type          string     `db:"type"           json:"type"`
	Sender        string     `db:"sender"         json:"sender"`
	DeclineReason string     `db:"decline_reason" json:"declineReason"`
	CreatedAt     time.Time  `db:"created_at"     json:"createdAt"`
	UpdatedAt     time.Time  `db:"updated_at"     json:"updatedAt"`
	DeletedAt     *time.Time `db:"deleted_at"     json:"deletedAt,omitempty"`
}

// TeamMember is a staff member managed by an admin.
type TeamMember struct {
	ID         uint       `db:"id"          json:"id"`
	UserID     string     `db:"user_id"     json:"userId"`
	Name       string     `db:"name"        json:"name"`
	Email      string     `db:"email"       json:"email"`
	Role       string     `db:"role"        json:"role"`
	Initials   string     `db:"initials"    json:"initials"`
	Color      string     `db:"color"       json:"color"`
	TasksNum   int        `db:"tasks_num"   json:"tasksNum"`
	TasksDone  int        `db:"tasks_done"  json:"tasksDone"`
	ClientsNum int        `db:"clients_num" json:"clientsNum"`
	Progress   int        `db:"progress"    json:"progress"`
	WorkingOn  string     `db:"working_on"  json:"workingOn"`
	CreatedAt  time.Time  `db:"created_at"  json:"createdAt"`
	UpdatedAt  time.Time  `db:"updated_at"  json:"updatedAt"`
	DeletedAt  *time.Time `db:"deleted_at"  json:"deletedAt,omitempty"`
}

// CalendarEvent is a social-media post scheduling entry.
type CalendarEvent struct {
	ID        uint       `db:"id"         json:"id"`
	UserID    string     `db:"user_id"    json:"user_id"`
	Title     string     `db:"title"      json:"title"`
	Client    string     `db:"client"     json:"client"`
	Platform  string     `db:"platform"   json:"platform"`
	Date      string     `db:"date"       json:"date"`
	Color     string     `db:"color"      json:"color"`
	CreatedAt time.Time  `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time  `db:"updated_at" json:"updatedAt"`
	DeletedAt *time.Time `db:"deleted_at" json:"deletedAt,omitempty"`
}

// BoardAccess grants a user access to a specific board.
type BoardAccess struct {
	ID          uint      `db:"id"           json:"id"`
	BoardID     uuid.UUID `db:"board_id"     json:"boardId"`
	TargetType  string    `db:"target_type"  json:"targetType"`
	TargetEmail string    `db:"target_email" json:"targetEmail"`
	Permission  string    `db:"permission"   json:"permission"`
	AdminID     string    `db:"admin_id"     json:"adminId"`
	CreatedAt   time.Time `db:"created_at"   json:"createdAt"`
}

// DocAccess grants a user access to a specific document.
type DocAccess struct {
	ID          uint      `db:"id"           json:"id"`
	DocID       uuid.UUID `db:"doc_id"       json:"docId"`
	TargetType  string    `db:"target_type"  json:"targetType"`
	TargetEmail string    `db:"target_email" json:"targetEmail"`
	Permission  string    `db:"permission"   json:"permission"`
	AdminID     string    `db:"admin_id"     json:"adminId"`
	CreatedAt   time.Time `db:"created_at"   json:"createdAt"`
}
