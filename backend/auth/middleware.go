package auth

import (
	"fmt"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// AuthRequired validates the Bearer token and sets userID/role/email on context locals.
// All values are stored as plain strings so controllers can safely do .(string).
func AuthRequired(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(401).JSON(fiber.Map{"error": "No token provided"})
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		// Read key at call-time so godotenv.Load() in main() has already run
		return []byte(os.Getenv("Security_Key")), nil
	})

	if err != nil || !token.Valid {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid or expired token"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	// Use fmt.Sprintf so .(string) type assertions in controllers never panic
	c.Locals("userID", fmt.Sprintf("%v", claims["userID"]))
	c.Locals("role",   fmt.Sprintf("%v", claims["role"]))
	c.Locals("email",  fmt.Sprintf("%v", claims["email"]))

	return c.Next()
}
