package controllers

import (
	"fmt"
	"reecho_media_crm/auth"
	"reecho_media_crm/database"
	"reecho_media_crm/models"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *fiber.Ctx) error {
    // Moved inside the function so it's unique per request
	var input struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Password Hashing [cite: 101, 232]
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), 10)

	user := models.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: string(hashedPassword),
		Role:     "admin", // Default to admin for main registration
	}

	// GORM will now call BeforeCreate and generate the UUID automatically
	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Email already registered"})
	}

	return c.Status(201).JSON(fiber.Map{"message": "Registered successfully"})
}

func Login(c *fiber.Ctx) error {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	var user models.User
	// Find user by email [cite: 107]
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	// Compare bcrypt hash [cite: 107, 232]
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	// Generate JWT [cite: 103, 111]
	token, _ := auth.GenerateJWT(user.ID, user.Role, user.Email)

	return c.JSON(fiber.Map{
		"token": token, 
		"user": fiber.Map{
			"id": user.ID,
			"name": user.Name,
			"email": user.Email,
			"role": user.Role,
		},
	})
}

func ChangePassword(c *fiber.Ctx) error {
	var input struct {
		CurrentPassword string `json:"currentPassword"`
		NewPassword     string `json:"newPassword"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	emailRaw := c.Locals("email")
	if emailRaw == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	email := fmt.Sprintf("%v", emailRaw)

	var user models.User
	if err := database.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.CurrentPassword)); err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Incorrect current password"})
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.NewPassword), 10)
	user.Password = string(hashedPassword)
	database.DB.Save(&user)

	return c.JSON(fiber.Map{"message": "Password updated successfully"})
}