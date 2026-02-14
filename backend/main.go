package main

import (
	"fmt"
	"log"
	"os"
	"reecho_media_crm/database"
	"reecho_media_crm/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

func main() {
	app := fiber.New()
	database.DBconnect()
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	routes.SetupRoutes(app)
	port := os.Getenv("PORT")
	if port == "" {
		log.Println("Error : Port was not defined.. in the .env")
	}

	fmt.Printf("server :%s has started......\n", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
