package main

import (
	"fmt"
	"log"
	"os"
	"reecho_media_crm/models"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	godotenv.Load()
	dsn := os.Getenv("DSN")
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true, // 🚀 disables prepared statement caching
	}), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	// Delete all users, clients, members, tasks, etc.
	db.Exec("DELETE FROM users")
	db.Exec("DELETE FROM clients")
	db.Exec("DELETE FROM team_members")
	db.Exec("DELETE FROM tasks")
	db.Exec("DELETE FROM invoices")
	db.Exec("DELETE FROM calendar_events")
	db.Exec("DELETE FROM boards")
	db.Exec("DELETE FROM documents")

	// Create new admin
    email := "priyathamtella@gmail.com"
    password := "reechomedia" // Clear password for the user
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), 10)

	admin := models.User{
		Name:     "Admin",
		Email:    email,
		Password: string(hashedPassword),
		Role:     "admin",
	}

	if err := db.Create(&admin).Error; err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Database cleaned. New admin created:\nEmail: %s\nPassword: %s\n", email, password)
}
