package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Board struct {
	ID             uuid.UUID       `gorm:"type:uuid;primaryKey" json:"ID"`
	Title          string          `gorm:"not null" json:"Title"`
	OwnerID        uuid.UUID       `gorm:"type:uuid;not null" json:"OwnerID"`
	FullState      json.RawMessage `gorm:"type:jsonb;default:'{}'" json:"fullState"`
	Zoom           float64         `gorm:"default:1.0" json:"Zoom"`
	PanX           float64         `gorm:"default:0" json:"PanX"`
	PanY           float64         `gorm:"default:0" json:"PanY"`
	ClientName     string          `gorm:"default:''" json:"ClientName"`
	ClientStatus   string          `gorm:"default:'Pending'" json:"ClientStatus"`
	ClientFeedback string          `gorm:"type:text;default:''" json:"ClientFeedback"`
	CreatedAt      time.Time       `json:"CreatedAt"`
	UpdatedAt      time.Time       `json:"UpdatedAt"`
}

// THIS IS CRITICAL: Generates the UUID before the DB insert
func (b *Board) BeforeCreate(tx *gorm.DB) (err error) {
	b.ID = uuid.New()
	return
}
