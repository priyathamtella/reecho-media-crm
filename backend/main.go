package main

import (
	"fmt"
	"log"
	"os"
	"reecho_media_crm/database"
	"reecho_media_crm/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	app := fiber.New()
	app.Use(cors.New(cors.Config{
	    AllowOrigins: "https://reechomedia.com,https://www.reechomedia.com",
	    AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	    AllowMethods: "GET, POST, PUT, DELETE",
	}))
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
