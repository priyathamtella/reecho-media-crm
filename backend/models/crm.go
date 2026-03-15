package models

import (
	"strings"

	"gorm.io/gorm"
)

type Client struct {
	gorm.Model
	UserID       string `json:"userId"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	Industry     string `json:"industry"`
	Package      string `json:"package"`
	Status       string `json:"status"`
	MonthlyValue int    `json:"monthlyValue"`
	Initials     string `json:"initials"`
	Color        string `json:"color"`
}

type Task struct {
	gorm.Model
	UserID        string `json:"userId"`
	Client        string `json:"client"`
	Title         string `json:"title"`
	Tag           string `json:"tag"`
	Status        string `json:"status"`
	DueDate       string `json:"dueDate"`
	Assignees     string `json:"assignees"`
	LinkedBoardID string `json:"linkedBoardId"`
	LinkedDocID   string `json:"linkedDocId"`
}

func SplitAssignees(s string) []string {
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	res := make([]string, 0, len(parts))
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			res = append(res, trimmed)
		}
	}
	return res
}

type Invoice struct {
	gorm.Model
	UserID    string `json:"userId"`
	InvoiceID string `json:"invoiceId"`
	Client    string `json:"client"`
	Service   string `json:"service"`
	Amount    int    `json:"amount"`
	Date      string `json:"date"`
	Status    string `json:"status"`
	Type      string `json:"type"`
	Sender    string `json:"sender"`
	DeclineReason string `json:"declineReason"`
}

type TeamMember struct {
	gorm.Model
	UserID     string `json:"userId"`
	Name       string `json:"name"`
	Email      string `json:"email"`
	Role       string `json:"role"`
	Initials   string `json:"initials"`
	Color      string `json:"color"`
	TasksNum   int    `json:"tasksNum"`
	TasksDone  int    `json:"tasksDone"`
	ClientsNum int    `json:"clientsNum"`
	Progress   int    `json:"progress"`
	WorkingOn  string `json:"workingOn"`
}

type CalendarEvent struct {
	gorm.Model
	UserID   string `json:"user_id"`
	Title    string `json:"title"`
	Client   string `json:"client"`
	Platform string `json:"platform"` // instagram, facebook, linkedin, twitter
	Date     string `json:"date"`      // YYYY-MM-DD
	Color    string `json:"color"`
}
