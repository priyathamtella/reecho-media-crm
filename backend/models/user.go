package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name      string    `gorm:"not null"`
	Email     string    `gorm:"uniqueIndex;not null"`
	Password  string    `gorm:"not null"` // Hashed via bcrypt [cite: 83, 101]
	Role      string    `gorm:"default:'admin'"` // 'admin', 'client', 'member'
	Boards    []Board   `gorm:"foreignKey:OwnerID"`
	CreatedAt time.Time
}

// THIS IS THE FIX: This generates the UUID automatically for every new user
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.New()
	return
}
