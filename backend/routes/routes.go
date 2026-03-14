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
	app.Post("/contact", controllers.ContactUs)

	// Protected routes (Requires JWT)
	api := app.Group("/api", auth.AuthRequired)
	api.Post("/change-password", controllers.ChangePassword)

	// Board Endpoints
	api.Get("/boards", controllers.GetAllBoards)        // See all boards
	api.Post("/boards", controllers.CreateBoard)        // Create brand new board
	api.Get("/boards/:id", controllers.GetBoard)        // Get specific board
	api.Post("/boards/:id/sync", controllers.SyncBoard) // Update/Sync board state
	api.Delete("/boards/:id", controllers.DeleteBoard)  // Delete a board
	api.Post("/boards/:id/share", controllers.ShareBoard)                   // Admin shares board with members
	api.Get("/boards/:id/shared-members", controllers.GetBoardSharedMembers) // Which members have access
	api.Post("/boards/:id/submit-review", controllers.SubmitBoardForReview) // Member submits board for review
	api.Post("/boards/:id/approve", controllers.ApproveBoardReview)         // Admin approves board

	// Document Endpoints
	api.Get("/docs", controllers.GetAllDocuments)                     // List all docs
	api.Post("/docs", controllers.CreateDocument)                     // Create doc
	api.Get("/docs/:id", controllers.GetDocument)                     // Get one doc
	api.Put("/docs/:id", controllers.UpdateDocument)                  // Update doc
	api.Delete("/docs/:id", controllers.DeleteDocument)               // Delete doc
	api.Get("/boards/:boardId/docs", controllers.GetDocumentsByBoard) // Docs linked to board
	api.Post("/docs/:id/share", controllers.ShareDoc)                         // Admin shares doc with members
	api.Get("/docs/:id/shared-members", controllers.GetDocSharedMembers)      // Which members have access
	api.Post("/docs/:id/submit-review", controllers.SubmitDocForReview)       // Member submits doc for review
	api.Post("/docs/:id/approve", controllers.ApproveDocReview)               // Admin approves doc

	// Team member list for dropdowns
	api.Get("/members-list", controllers.GetTeamMembersList)

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
	api.Put("/invoices/:id", controllers.UpdateInvoice)

	api.Get("/team", controllers.GetTeamMembers)
	api.Post("/team", controllers.CreateTeamMember)
	api.Put("/team/:id", controllers.UpdateTeamMember)
	api.Delete("/team/:id", controllers.DeleteTeamMember)

	// Calendar Event Endpoints
	api.Get("/calendar", controllers.GetCalendarEvents)
	api.Post("/calendar", controllers.CreateCalendarEvent)
	api.Delete("/calendar/:id", controllers.DeleteCalendarEvent)
}
