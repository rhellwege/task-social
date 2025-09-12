package middleware

import (
	"io"

	"github.com/gofiber/fiber/v2"
)

// ImageUploadMiddleware handles profile picture uploads
func ImageUploadMiddleware(uploadDir string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		fileHeader, err := c.FormFile("image")
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "missing image file")
		}

		f, err := fileHeader.Open()
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to read image")
		}
		defer f.Close()

		fileBytes, err := io.ReadAll(f)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to read image bytes")
		}

		// store bytes in context
		c.Locals("uploadedImageBytes", fileBytes)

		return c.Next()
	}
}
