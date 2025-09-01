package handlers

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/rhellwege/task-social/internal/api/services"
)

// GetUser godoc
//
//	@Summary		Get user information
//	@Description	Get user information by ID
//	@Tags			User
//	@Accept			json
//	@Produce		json
//	@Param			id	path		string	true	"User ID"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		404	{object}	map[string]interface{}
//	@Router			/user/{id} [get]
func GetUser(userService services.UserServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		id := c.Params("id")
		log.Println(id)
		user, err := userService.GetUserDisplay(ctx, id)
		if err != nil {
			c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
			return err
		}
		c.JSON(user)
		return nil
	}
}

type RegisterUserRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

// RegisterUser godoc
//
//	@Summary		Register a new user
//	@Description	Register a new user with email, username, and password
//	@Tags			User
//	@Accept			json
//	@Produce		json
//	@Param			user	body		RegisterUserRequest	true	"User registration details"
//	@Success		201		{object}	map[string]interface{}
//	@Failure		400		{object}	map[string]interface{}
//	@Failure		500		{object}	map[string]interface{}
//	@Router			/register [post]
func RegisterUser(userService services.UserServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		var params RegisterUserRequest
		if err := c.BodyParser(&params); err != nil {
			c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": err.Error(),
			})
			return err
		}
		// id should be token instead.
		id, err := userService.RegisterUser(ctx, params.Username, params.Password, params.Email)
		if err != nil {
			c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": err.Error(),
			})
			return err
		}
		c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"message": "User created successfully",
			"id":      id,
		})
		return nil
	}
}
