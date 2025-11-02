package middleware

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/rhellwege/task-social/internal/api/handlers"
	"github.com/rhellwege/task-social/internal/api/services"
)

// Takes JWT token from Authorization header and inserts the userID into the context
func ProtectedRoute(authService services.AuthServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		tokenString := c.Get("Authorization")
		tokenString = strings.TrimPrefix(tokenString, "Bearer ")
		if tokenString == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(handlers.ErrorResponse{
				Error: "Unauthorized: missing token",
			})
		}

		token, err := authService.VerifyToken(ctx, tokenString)
		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(handlers.ErrorResponse{
				Error: "Unauthorized: malformed token",
			})
		}

		expTime, err := token.Claims.GetExpirationTime()
		if err != nil || expTime.Before(time.Now()) {
			return c.Status(fiber.StatusUnauthorized).JSON(handlers.ErrorResponse{
				Error: "Unauthorized: expired token",
			})
		}

		subject, err := token.Claims.GetSubject()
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(handlers.ErrorResponse{
				Error: "Unauthorized: invalid token",
			})
		}

		c.Locals("userID", subject)
		c.Locals("jwt", token)

		return c.Next()
	}
}
