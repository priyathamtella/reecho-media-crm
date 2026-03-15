package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// BoardAccess grants a user (member or client) access to a specific board
type BoardAccess struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	BoardID     uuid.UUID `gorm:"type:uuid;not null;index" json:"boardId"`
	TargetType  string    `gorm:"not null" json:"targetType"`
	TargetEmail string    `gorm:"not null;index" json:"targetEmail"`
	Permission  string    `gorm:"default:'viewer'" json:"permission"`
	AdminID     *string   `gorm:"default:null" json:"adminId,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
}

func (ba *BoardAccess) BeforeCreate(tx *gorm.DB) error { return nil }

// DocAccess grants a user (member or client) access to a specific document
type DocAccess struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	DocID       uuid.UUID `gorm:"type:uuid;not null;index" json:"docId"`
	TargetType  string    `gorm:"not null" json:"targetType"`
	TargetEmail string    `gorm:"not null;index" json:"targetEmail"`
	Permission  string    `gorm:"default:'viewer'" json:"permission"`
	AdminID     *string   `gorm:"default:null" json:"adminId,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
}

func (da *DocAccess) BeforeCreate(tx *gorm.DB) error { return nil }
