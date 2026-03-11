package routes

import (
	"reecho_media_crm/auth"
	"reecho_media_crm/controllers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	// Public routes
	app.Post("/register", controllers.Register)
	app.Post("/login", controllers.Login)

	// Protected routes (Requires JWT)
	api := app.Group("/api", auth.AuthRequired)

	// Board Endpoints
	api.Get("/boards", controllers.GetAllBoards)        // See all boards
	api.Post("/boards", controllers.CreateBoard)        // Create brand new board
	api.Get("/boards/:id", controllers.GetBoard)        // Get specific board
	api.Post("/boards/:id/sync", controllers.SyncBoard) // Update/Sync board state
	api.Delete("/boards/:id", controllers.DeleteBoard)  // Delete a board

	// Document Endpoints
	api.Get("/docs", controllers.GetAllDocuments)                     // List all docs
	api.Post("/docs", controllers.CreateDocument)                     // Create doc
	api.Get("/docs/:id", controllers.GetDocument)                     // Get one doc
	api.Put("/docs/:id", controllers.UpdateDocument)                  // Update doc
	api.Delete("/docs/:id", controllers.DeleteDocument)               // Delete doc
	api.Get("/boards/:boardId/docs", controllers.GetDocumentsByBoard) // Docs linked to board

	// CRM Endpoints
	api.Get("/clients", controllers.GetClients)
	api.Post("/clients", controllers.CreateClient)
	api.Delete("/clients/:id", controllers.DeleteClient)

	api.Get("/tasks", controllers.GetTasks)
	api.Post("/tasks", controllers.CreateTask)
	api.Put("/tasks/:id", controllers.UpdateTask)
	api.Delete("/tasks/:id", controllers.DeleteTask)

	api.Get("/invoices", controllers.GetInvoices)
	api.Post("/invoices", controllers.CreateInvoice)

	api.Get("/team", controllers.GetTeamMembers)
	api.Post("/team", controllers.CreateTeamMember)
	api.Put("/team/:id", controllers.UpdateTeamMember)
	api.Delete("/team/:id", controllers.DeleteTeamMember)

	// Calendar Event Endpoints
	api.Get("/calendar", controllers.GetCalendarEvents)
	api.Post("/calendar", controllers.CreateCalendarEvent)
	api.Delete("/calendar/:id", controllers.DeleteCalendarEvent)
}
