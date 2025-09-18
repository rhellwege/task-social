package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rhellwege/task-social/internal/api/services"
	"github.com/rhellwege/task-social/internal/db/repository"
)

// CreateClub godoc
//
//	@ID				CreateClub
//	@Summary		Create a new club
//	@Description	Create a new club with the provided details.
//	@Tags			Club
//	@Accept			json
//	@Produce		json
//	@Security		ApiKeyAuth
//	@Param			user	body		services.CreateClubRequest	true	"User update details"
//	@Success		201		{object}	CreatedResponse
//	@Failure		400		{object}	ErrorResponse
//	@Failure		401		{object}	ErrorResponse
//	@Failure		500		{object}	ErrorResponse
//	@Router			/api/club [post]
func CreateClub(clubService services.ClubServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		userID := c.Locals("userID").(string)

		var params services.CreateClubRequest
		if err := c.BodyParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		if params.Name == "" {
			return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
				Error: "Club name is required",
			})
		}

		clubID, err := clubService.CreateClub(ctx, userID, params)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.Status(fiber.StatusCreated).JSON(CreatedResponse{
			Message: "Club created successfully",
			ID:      clubID,
		})
	}
}

// GetPublicClubs godoc
//
//	@ID				GetPublicClubs
//	@Summary		Get public clubs
//	@Description	Get a list of public clubs.
//	@Tags			Club
//	@Security		ApiKeyAuth
//	@Produce		json
//	@Success		200	{array}		repository.Club
//	@Failure		401	{object}	ErrorResponse
//	@Failure		500	{object}	ErrorResponse
//	@Router			/api/clubs [get]
func GetPublicClubs(clubService services.ClubServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()

		clubs, err := clubService.GetPublicClubs(ctx)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.JSON(clubs)
	}
}

// JoinClub godoc
//
//	@ID				JoinClub
//	@Summary		Join a club
//	@Description	Join a club with the given ID.
//	@Tags			Club
//	@Produce		json
//	@Security		ApiKeyAuth
//	@Param			club_id	path		string	true	"Club ID"
//	@Success		200		{object}	SuccessResponse
//	@Failure		401		{object}	ErrorResponse
//	@Failure		500		{object}	ErrorResponse
//	@Router			/api/club/{club_id}/join [post]
func JoinClub(clubService services.ClubServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		userID := c.Locals("userID").(string)
		clubID := c.Params("club_id")

		err := clubService.JoinClub(ctx, userID, clubID, false)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.Status(fiber.StatusOK).JSON(SuccessResponse{
			Message: "Successfully joined club",
		})
	}
}

// LeaveClub godoc
//
//	@ID				LeaveClub
//	@Summary		Leave a club
//	@Description	Leave a club with the given ID.
//	@Tags			Club
//	@Produce		json
//	@Security		ApiKeyAuth
//	@Param			club_id	path		string	true	"Club ID"
//	@Success		200		{object}	SuccessResponse
//	@Failure		401		{object}	ErrorResponse
//	@Failure		500		{object}	ErrorResponse
//	@Router			/api/club/{club_id}/leave [post]
func LeaveClub(clubService services.ClubServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		userID := c.Locals("userID").(string)
		clubID := c.Params("club_id")

		params := repository.DeleteClubMembershipParams{
			UserID: userID,
			ClubID: clubID,
		}

		err := clubService.LeaveClub(ctx, params)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.Status(fiber.StatusOK).JSON(SuccessResponse{
			Message: "Successfully left club",
		})
	}
}

// DeleteClub godoc
//
//	@ID				DeleteClub
//	@Summary		Delete a club
//	@Description	Delete a club with the given ID.
//	@Tags			Club
//	@Produce		json
//	@Security		ApiKeyAuth
//	@Param			club_id	path		string	true	"Club ID"
//	@Success		200		{object}	SuccessResponse
//	@Failure		401		{object}	ErrorResponse
//	@Failure		500		{object}	ErrorResponse
//	@Router			/api/club/{club_id} [delete]
func DeleteClub(clubService services.ClubServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		userID := c.Locals("userID").(string)
		clubID := c.Params("club_id")

		err := clubService.DeleteClub(ctx, userID, clubID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.Status(fiber.StatusOK).JSON(SuccessResponse{
			Message: "Successfully deleted club",
		})
	}
}

type UpdateClubRequest struct {
	Name        *string `json:"name,omitempty"`
	Description *string `json:"description,omitempty"`
	BannerImage *string `json:"banner_image,omitempty"`
	IsPublic    *bool   `json:"is_public,omitempty"`
}

// UpdateClub godoc
//
//	@ID				UpdateClub
//	@Summary		Update a club
//	@Description	Update a club with the given ID.
//	@Tags			Club
//	@Accept			json
//	@Produce		json
//	@Security		ApiKeyAuth
//	@Param			club_id	path		string				true	"Club ID"
//	@Param			club	body		UpdateClubRequest	true	"Club update params"
//	@Success		200		{object}	SuccessResponse
//	@Failure		400		{object}	ErrorResponse
//	@Failure		401		{object}	ErrorResponse
//	@Failure		500		{object}	ErrorResponse
//	@Router			/api/club/{club_id} [put]
func UpdateClub(clubService services.ClubServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		userID := c.Locals("userID").(string)
		clubID := c.Params("club_id")

		var params UpdateClubRequest
		if err := c.BodyParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		if params.Name != nil && *params.Name == "" {
			return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
				Error: "Club name cannot be empty",
			})
		}

		dbParams := repository.UpdateClubParams{
			Name:        params.Name,
			Description: params.Description,
			BannerImage: params.BannerImage,
			IsPublic:    params.IsPublic,
			ID:          clubID,
		}

		err := clubService.UpdateClub(ctx, userID, dbParams)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.Status(fiber.StatusOK).JSON(SuccessResponse{
			Message: "Successfully updated club",
		})
	}
}

// GetClubLeaderboard godoc
//
//	@ID				GetClubLeaderboard
//	@Summary		Get a club's leaderboard
//	@Description	Get a club's leaderboard with the given ID.
//	@Tags			Club
//	@Accept			json
//	@Produce		json
//	@Security		ApiKeyAuth
//	@Param			club_id	path		string	true	"Club ID"
//	@Success		200		{array}		repository.GetClubLeaderboardRow
//	@Failure		401		{object}	ErrorResponse
//	@Failure		500		{object}	ErrorResponse
//	@Router			/api/club/{club_id}/leaderboard [get]
func GetClubLeaderboard(clubService services.ClubServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		userID := c.Locals("userID").(string)
		clubID := c.Params("club_id")

		rows, err := clubService.GetClubLeaderboard(ctx, userID, clubID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.Status(fiber.StatusOK).JSON(rows)
	}
}

// GetClub godoc
//
//	@ID				GetClub
//	@Summary		Get club info
//	@Description	Get club info
//	@Tags			Club
//	@Security		ApiKeyAuth
//	@Produce		json
//	@Success		200	{object}	repository.Club
//	@Failure		401	{object}	ErrorResponse
//	@Failure		500	{object}	ErrorResponse
//	@Router			/api/{club_id} [get]
func GetClub(clubService services.ClubServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		userID := c.Locals("userID").(string)
		clubID := c.Params("club_id")

		club, err := clubService.GetClub(ctx, userID, clubID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.Status(fiber.StatusOK).JSON(club)
	}
}
