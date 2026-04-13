package auth

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// GenerateJWT creates a signed HS256 token with userID, role, and email.
// The key is read from the environment at call-time so godotenv.Load() in
// main() always runs before the key is read.
func GenerateJWT(userID uuid.UUID, role, email string) (string, error) {
	claims := jwt.MapClaims{
		"userID": userID.String(),
		"role":   role,
		"email":  email,
		"exp":    time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(os.Getenv("Security_Key")))
}

// ExtractSecertKey is kept for compatibility (name matches existing usages).
func ExtractSecertKey(token *jwt.Token) (interface{}, error) {
	return []byte(os.Getenv("Security_Key")), nil
}
