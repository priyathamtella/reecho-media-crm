package routes

import (
	"reecho_media_crm/controllers"
	"reecho_media_crm/auth"
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	// Public routes
	app.Post("/register", controllers.Register)
	app.Post("/login", controllers.Login)

	// Protected routes (Requires JWT)
	api := app.Group("/api", auth.AuthRequired)

	// Board Endpoints [cite: 198]
	api.Get("/boards", controllers.GetAllBoards)       // See all boards
	api.Post("/boards", controllers.CreateBoard)      // Create brand new board
	api.Get("/boards/:id", controllers.GetBoard)      // Get specific board
	api.Post("/boards/:id/sync", controllers.SyncBoard) // Update/Sync board state
}