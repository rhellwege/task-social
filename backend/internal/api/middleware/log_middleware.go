package middleware

import (
	"fmt"
	"slices"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func BodyLogger(output logger.Buffer, c *fiber.Ctx, data *logger.Data, extraParam string) (int, error) {
	if slices.Contains(c.GetReqHeaders()["Content-Type"], "application/json") {
		reqStr := string(c.Body())
		n, err := fmt.Fprintf(output, "\n\t--> %s", reqStr)
		if err != nil {
			return n, err
		}
	}

	if slices.Contains(c.GetRespHeaders()["Content-Type"], "application/json") {
		respStr := string(c.Response().Body())
		n, err := fmt.Fprintf(output, "\n\t<-- %s\n", respStr)
		if err != nil {
			return n, err
		}
	}

	return 0, nil
}
