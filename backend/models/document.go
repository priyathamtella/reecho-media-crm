package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Document is a rich-text PDF/note stored in the workspace
type Document struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	Title         string     `gorm:"not null" json:"title"`
	Content       string     `gorm:"type:text;default:''" json:"content"`
	OwnerID       uuid.UUID  `gorm:"type:uuid;not null" json:"ownerId"`
	LinkedBoardID *uuid.UUID `gorm:"type:uuid" json:"linkedBoardId"`
	LinkedTaskID  uint       `json:"linkedTaskId"`
	ReviewStatus  string     `gorm:"default:''" json:"reviewStatus"`
	ReviewerName  string     `gorm:"default:''" json:"reviewerName"`
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
}

func (d *Document) BeforeCreate(tx *gorm.DB) (err error) {
	d.ID = uuid.New()
	return
}
