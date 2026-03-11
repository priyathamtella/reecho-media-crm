package models

import "gorm.io/gorm"

type Client struct {
	gorm.Model
	UserID       string `json:"user_id"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	Industry     string `json:"industry"`
	Package      string `json:"package"`
	Status       string `json:"status"` // Active, Review, Paused
	MonthlyValue int    `json:"monthly_value"`
	Initials     string `json:"initials"`
	Color        string `json:"color"`
}

type Task struct {
	gorm.Model
	UserID    string `json:"user_id"`
	Client    string `json:"client"`
	Title     string `json:"title"`
	Tag       string `json:"tag"`    // Content, Design, Ads, SEO
	Status    string `json:"status"` // To Do, In Progress, In Review, Done
	DueDate   string `json:"due_date"`
	Assignees string `json:"assignees"`
}

type Invoice struct {
	gorm.Model
	UserID    string `json:"user_id"`
	InvoiceID string `json:"invoice_id"`
	Client    string `json:"client"`
	Service   string `json:"service"`
	Amount    int    `json:"amount"`
	Date      string `json:"date"`
	Status    string `json:"status"` // Paid, Pending, Overdue
}

type TeamMember struct {
	gorm.Model
	UserID     string `json:"user_id"`
	Name       string `json:"name"`
	Email      string `json:"email"`
	Role       string `json:"role"`
	Initials   string `json:"initials"`
	Color      string `json:"color"`
	TasksNum   int    `json:"tasks_num"`
	TasksDone  int    `json:"tasks_done"`
	ClientsNum int    `json:"clients_num"`
	Progress   int    `json:"progress"`
	WorkingOn  string `json:"working_on"`
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
