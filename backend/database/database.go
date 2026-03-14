package database

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

var DB *gorm.DB

func DBconnect() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}
	dsn := os.Getenv("DSN")
	DB, err = gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true, // 🚀 disables prepared statement caching
	}), &gorm.Config{})
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	// Auto migrate the schema
	DB.AutoMigrate(
		&models.User{},
		&models.Board{},
		&models.Document{},
		&models.Client{},
		&models.Task{},
		&models.Invoice{},
		&models.TeamMember{},
		&models.CalendarEvent{},
		&models.BoardAccess{},
		&models.DocAccess{},
	)
	fmt.Println(" DB connected successfully....")

	// Ensure standard admin exists
	adminEmail := "priyathamtella@gmail.com"
	adminPassword := "reechomedia"
	var admin models.User
	if err := DB.Where("email = ?", adminEmail).First(&admin).Error; err != nil {
		// Not found, create it
		hashed, _ := bcrypt.GenerateFromPassword([]byte(adminPassword), 10)
		admin = models.User{
			Name:     "Admin",
			Email:    adminEmail,
			Password: string(hashed),
			Role:     "admin",
		}
		DB.Create(&admin)
		fmt.Println("Default admin created.")
	} else {
		// Found, just ensure password is reechomedia for now if desired, 
		// but usually we just want to make sure the user exists.
		// User specifically asked to "keep admin email... and password... and make sure they work"
		hashed, _ := bcrypt.GenerateFromPassword([]byte(adminPassword), 10)
		DB.Model(&admin).Update("password", string(hashed))
		fmt.Println("Admin credentials synced.")
	}
}
