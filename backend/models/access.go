package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// BoardAccess grants a team member access to a specific board
type BoardAccess struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	BoardID   uuid.UUID `gorm:"type:uuid;not null;index" json:"BoardID"`
	MemberID  uint      `gorm:"not null;index" json:"MemberID"`   // TeamMember.ID
	AdminID   string    `gorm:"not null" json:"AdminID"`           // owner admin's user ID
	CreatedAt time.Time `json:"CreatedAt"`
}

func (ba *BoardAccess) BeforeCreate(tx *gorm.DB) error { return nil }

// DocAccess grants a team member access to a specific document
type DocAccess struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	DocID     uuid.UUID `gorm:"type:uuid;not null;index" json:"DocID"`
	MemberID  uint      `gorm:"not null;index" json:"MemberID"`   // TeamMember.ID
	AdminID   string    `gorm:"not null" json:"AdminID"`           // owner admin's user ID
	CreatedAt time.Time `json:"CreatedAt"`
}

func (da *DocAccess) BeforeCreate(tx *gorm.DB) error { return nil }
