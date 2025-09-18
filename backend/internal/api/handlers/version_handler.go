package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rhellwege/task-social/config"
)

type VersionResponse struct {
	Version    string `json:"version"`
	CommitHash string `json:"commit_hash"`
	BuildDate  string `json:"build_date"`
}

// Version godoc
//
//	@ID				Version
//	@Summary		Get the current version of the API
//	@Description	Current version of the API
//	@Tags			Util
//	@Produce		json
//	@Success		200	{object}	VersionResponse
//	@Failure		500	{object}	ErrorResponse
//	@Router			/api/version [get]
func Version() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(VersionResponse{
			Version:    config.Version,
			CommitHash: config.CommitHash,
			BuildDate:  config.BuildDate,
		})
	}
}
