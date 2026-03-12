package auth

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var jwtkey = []byte(os.Getenv("Security_Key"))

func GenerateJWT(userID uuid.UUID, role, email string) (string, error) {
	claims := jwt.MapClaims{
		"userID": userID.String(),
		"role":   role,
		"email":  email,
		"exp":    time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtkey)
}

func ExtractSecertKey(token *jwt.Token) (interface{}, error) {
	return jwtkey, nil
}
