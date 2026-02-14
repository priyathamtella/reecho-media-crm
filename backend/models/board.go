package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Board struct {
	ID        uuid.UUID       `gorm:"type:uuid;primaryKey"`
	Title     string          `gorm:"not null"`
	OwnerID   uuid.UUID       `gorm:"type:uuid;not null"`
	FullState json.RawMessage `gorm:"type:jsonb;default:'{}'" json:"fullState"`
	Zoom      float64         `gorm:"default:1.0"`
	PanX      float64         `gorm:"default:0"`
	PanY      float64         `gorm:"default:0"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

// THIS IS CRITICAL: Generates the UUID before the DB insert
func (b *Board) BeforeCreate(tx *gorm.DB) (err error) {
	b.ID = uuid.New()
	return
}
