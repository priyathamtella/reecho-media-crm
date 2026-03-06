package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Document is a rich-text PDF/note stored in the workspace
type Document struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey" json:"ID"`
	Title         string     `gorm:"not null" json:"Title"`
	Content       string     `gorm:"type:text;default:''" json:"Content"` // HTML rich text
	OwnerID       uuid.UUID  `gorm:"type:uuid;not null" json:"OwnerID"`
	LinkedBoardID *uuid.UUID `gorm:"type:uuid" json:"LinkedBoardID"` // optional board link
	CreatedAt     time.Time  `json:"CreatedAt"`
	UpdatedAt     time.Time  `json:"UpdatedAt"`
}

func (d *Document) BeforeCreate(tx *gorm.DB) (err error) {
	d.ID = uuid.New()
	return
}
