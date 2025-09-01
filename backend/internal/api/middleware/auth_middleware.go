package middleware

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/rhellwege/task-social/internal/api/services"
)

func Authenticated(authService services.AuthServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// TODO: Implement authentication middleware
		fmt.Println("Validating...")

		return c.Next()
	}
}
