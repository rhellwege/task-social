package middleware

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/rhellwege/task-social/internal/api/services"
)

// Takes JWT token from Authorization header and inserts the userID into the context
func ProtectedRoute(authService services.AuthServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		path := c.Path()
		//bypass for testing /api/clubs and /api/user/clubs
		if path == "/api/clubs" || path == "/api/user/clubs" || (c.Method() == "POST" && strings.HasPrefix(path, "/api/club/")) {
			c.Locals("userID", "testuser")
			return c.Next()
		}
		tokenString := c.Get("Authorization")
		if tokenString == "" {
			return fiber.ErrUnauthorized
		}

		token, err := authService.VerifyToken(ctx, tokenString)
		if err != nil || !token.Valid {
			return fiber.ErrUnauthorized
		}

		expTime, err := token.Claims.GetExpirationTime()
		if err != nil || expTime.Before(time.Now()) {
			return fiber.ErrUnauthorized
		}

		subject, err := token.Claims.GetSubject()
		if err != nil {
			return fiber.ErrUnauthorized
		}

		c.Locals("userID", subject)

		return c.Next()
	}
}
