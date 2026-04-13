package main

import (
	"log"
	"os"
	"reecho_media_crm/database"
	"reecho_media_crm/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	// ── 1. Load .env FIRST — before anything reads os.Getenv ──────────────
	if err := godotenv.Load(); err != nil {
		log.Println("[env] .env not found — using system environment variables")
	}

	// ── 2. Stdout logging (Render captures stdout) ─────────────────────────
	log.SetOutput(os.Stdout)
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)

	// ── 3. Port ────────────────────────────────────────────────────────────
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Println("[warn] PORT not set, defaulting to 8080")
	}

	// ── 4. Connect DB ──────────────────────────────────────────────────────
	database.DBconnect()

	// ── 5. Fiber ───────────────────────────────────────────────────────────
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			log.Printf("[ERROR] %s %s — %v", c.Method(), c.Path(), err)
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		},
	})

	// ── 6. CORS — must come BEFORE any other middleware ───────────────────
	// This handles ALL methods including OPTIONS preflight requests.
	app.Use(cors.New(cors.Config{
		AllowOriginsFunc: func(origin string) bool {
			allowed := map[string]bool{
				"https://reechomedia.com":       true,
				"https://www.reechomedia.com":   true,
				"http://localhost:5173":          true,
				"http://localhost:3000":          true,
			}
			return allowed[origin]
		},
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowCredentials: false,
		MaxAge:           86400, // Cache preflight for 24h
	}))

	// ── 7. Handle OPTIONS preflight explicitly for all routes ─────────────
	app.Options("/*", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusNoContent)
	})

	// ── 8. HTTP logger ────────────────────────────────────────────────────
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} ${method} ${path} — ${latency}\n",
	}))

	// ── 9. Routes ──────────────────────────────────────────────────────────
	routes.SetupRoutes(app)

	log.Printf("[server] Listening on :%s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("[server] Failed to start: %v", err)
	}
}
