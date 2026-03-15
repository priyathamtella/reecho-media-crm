package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Board struct {
	ID             uuid.UUID       `gorm:"type:uuid;primaryKey" json:"id"`
	Title          string          `gorm:"not null" json:"title"`
	OwnerID        uuid.UUID       `gorm:"type:uuid;not null" json:"ownerId"`
	FullState      json.RawMessage `gorm:"type:jsonb;default:'{}'" json:"fullState"`
	Zoom           float64         `gorm:"default:1.0" json:"zoom"`
	PanX           float64         `gorm:"default:0" json:"panX"`
	PanY           float64         `gorm:"default:0" json:"panY"`
	ClientName     string          `gorm:"default:''" json:"clientName"`
	ClientStatus   string          `gorm:"default:'Pending'" json:"clientStatus"`
	ClientFeedback string          `gorm:"type:text;default:''" json:"clientFeedback"`
	LinkedTaskID   uint            `json:"linkedTaskId"`
	LinkedDocID    *uuid.UUID      `gorm:"type:uuid" json:"linkedDocId"`
	ReviewStatus   string          `gorm:"default:''" json:"reviewStatus"`
	ReviewerName   string          `gorm:"default:''" json:"reviewerName"`
	CreatedAt      time.Time       `json:"createdAt"`
	UpdatedAt      time.Time       `json:"updatedAt"`
}

// THIS IS CRITICAL: Generates the UUID before the DB insert
func (b *Board) BeforeCreate(tx *gorm.DB) (err error) {
	b.ID = uuid.New()
	return
}
