package handlers

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/rhellwege/task-social/internal/api/services"
	"github.com/rhellwege/task-social/internal/db/repository"
)

// GetUser godoc
//
//	@ID				GetUser
//	@Summary		Get user information
//	@Description	Get user information by ID
//	@Tags			User
//	@Accept			json
//	@Produce		json
//	@Security		ApiKeyAuth
//	@Success		200	{object}	repository.GetUserDisplayRow
//	@Failure		404	{object}	ErrorResponse
//	@Failure		401	{object}	ErrorResponse
//	@Router			/api/user [get]
func GetUser(userService services.UserServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		id := c.Locals("userID").(string)
		log.Println(id)
		user, err := userService.GetUserDisplay(ctx, id)
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.JSON(user)
	}
}

// GetUserByID godoc
//
//	@ID				GetUserByID
//	@Summary		Get user information by ID
//	@Description	Get public user information by ID
//	@Tags			User
//	@Accept			json
//	@Produce		json
//	@Security		ApiKeyAuth
//	@Param			id	path		string	true	"User ID"
//	@Success		200	{object}	repository.GetUserDisplayRow
//	@Failure		404	{object}	ErrorResponse
//	@Failure		401	{object}	ErrorResponse
//	@Router			/api/user/{id} [get]
func GetUserByID(userService services.UserServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		id := c.Params("id")
		user, err := userService.GetUserDisplay(ctx, id)
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.JSON(user)
	}
}

type RegisterUserRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

// RegisterUser godoc
//
//	@ID				RegisterUser
//	@Summary		Register a new user
//	@Description	Register a new user with email, username, and password
//	@Tags			User
//	@Accept			json
//	@Produce		json
//	@Param			user	body		RegisterUserRequest	true	"User registration details"
//	@Success		201		{object}	SuccessfulLoginResponse
//	@Failure		400		{object}	ErrorResponse
//	@Failure		500		{object}	ErrorResponse
//	@Router			/api/register [post]
func RegisterUser(userService services.UserServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		var params RegisterUserRequest
		if err := c.BodyParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		tokenString, err := userService.RegisterUser(ctx, params.Username, params.Password, params.Email)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}
		return c.Status(fiber.StatusCreated).JSON(SuccessfulLoginResponse{
			Message: "User registered and logged in successfully",
			Token:   tokenString,
		})
	}
}

type LoginUserRequest struct {
	Email    *string `json:"email,omitempty"`
	Username *string `json:"username,omitempty"`
	Password string  `json:"password"`
}

// LoginUser godoc
//
//	@ID				LoginUser
//	@Summary		Login a user
//	@Description	Login a user with (email or username) and password
//	@Tags			User
//	@Accept			json
//	@Produce		json
//	@Param			user	body		LoginUserRequest	true	"User login credentials"
//	@Success		200		{object}	SuccessfulLoginResponse
//	@Failure		400		{object}	ErrorResponse
//	@Failure		500		{object}	ErrorResponse
//	@Router			/api/login [post]
func LoginUser(userService services.UserServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		var params LoginUserRequest
		if err := c.BodyParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{Error: err.Error()})
		}

		tokenString, err := userService.LoginUser(ctx, params.Username, params.Email, params.Password)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.Status(fiber.StatusOK).JSON(SuccessfulLoginResponse{
			Message: "User logged in successfully",
			Token:   tokenString,
		})
	}
}

type UpdateUserRequest struct {
	Username       *string `json:"username,omitempty"`
	Email          *string `json:"email,omitempty"`
	Password       *string `json:"password,omitempty"`
	ProfilePicture *string `json:"profile_picture,omitempty"`
}

// UpdateUser godoc
//
//	@ID				UpdateUser
//	@Summary		Update an existing user
//	@Description	Update an existing user's details, all parameters are optional.
//	@Tags			User
//	@Accept			json
//	@Produce		json
//	@Security		ApiKeyAuth
//	@Param			user	body		UpdateUserRequest	true	"User update details"
//	@Success		200		{object}	SuccessResponse
//	@Failure		400		{object}	ErrorResponse
//	@Failure		401		{object}	ErrorResponse
//	@Failure		500		{object}	ErrorResponse
//	@Router			/api/user [put]
func UpdateUser(userService services.UserServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		id := c.Locals("userID").(string)

		var params UpdateUserRequest
		if err := c.BodyParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		dbParams := repository.UpdateUserParams{
			ID:             id,
			Username:       params.Username,
			Email:          params.Email,
			Password:       params.Password,
			ProfilePicture: params.ProfilePicture,
		}

		err := userService.UpdateUser(ctx, dbParams)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.Status(fiber.StatusOK).JSON(SuccessResponse{
			Message: "User updated successfully",
		})
	}
}

// GetUserClubs godoc
//
//	@ID				GetUserClubs
//	@Summary		Get a list of a user's joined clubs
//	@Description	Get a list of a user's joined clubs
//	@Tags			User
//	@Security		ApiKeyAuth
//	@Produce		json
//	@Success		200	{array}		repository.GetUserClubsRow
//	@Failure		401	{object}	ErrorResponse
//	@Failure		500	{object}	ErrorResponse
//	@Router			/api/user/clubs [get]
func GetUserClubs(userService services.UserServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		id := c.Locals("userID").(string)

		clubs, err := userService.GetUserClubs(ctx, id)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.Status(fiber.StatusOK).JSON(clubs)
	}
}

// UploadProfilePicture godoc
//
//	@ID				UploadProfilePicture
//	@Summary		Upload a profile picture
//	@Description	Upload a new profile picture for the authenticated user
//	@Tags			User
//	@Accept			multipart/form-data
//	@Produce		json
//	@Param			image	formData	file	true	"Profile picture file"
//	@Security		ApiKeyAuth
//	@Success		200	{object}	UploadProfilePictureResponse
//	@Failure		400	{object}	ErrorResponse
//	@Failure		401	{object}	ErrorResponse
//	@Failure		500	{object}	ErrorResponse
//	@Router			/api/user/profile-picture [post]
func UploadProfilePicture(userService services.UserServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		userID := c.Locals("userID").(string)

		// Get uploaded file
		file, err := c.FormFile("image")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
				Error: "No file uploaded",
			})
		}

		f, err := file.Open()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: "Failed to read uploaded file",
			})
		}
		defer f.Close()

		// Read file bytes
		fileBytes := c.Locals("uploadedImageBytes").([]byte)

		// Call UserService to save image and update DB
		url, err := userService.UploadProfilePicture(ctx, userID, fileBytes)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.JSON(UploadProfilePictureResponse{
			Message: "Profile picture uploaded successfully",
			URL:     url,
		})
	}
}

// Response type for profile picture upload
type UploadProfilePictureResponse struct {
	Message string `json:"message"`
	URL     string `json:"url"`
}

// GetUserMetrics godoc
//
//	@ID				GetUserMetrics
//	@Summary		Get user metrics
//	@Description	Get all metrics for a user from all joined clubs.
//	@Tags			User
//	@Security		ApiKeyAuth
//	@Produce		json
//	@Success		200	{array}		repository.Metric
//	@Failure		401	{object}	ErrorResponse
//	@Failure		500	{object}	ErrorResponse
//	@Router			/api/user/metrics [get]
func GetUserMetrics(userService services.UserServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		userID := c.Locals("userID").(string)

		metrics, err := userService.GetUserMetrics(ctx, userID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.JSON(metrics)
	}
}

// GetUserMetricEntries godoc
//
//	@ID				GetUserMetricEntries
//	@Summary		Get user metric entries
//	@Description	Get all metric entries turned in by a user.
//	@Tags			User
//	@Security		ApiKeyAuth
//	@Produce		json
//	@Success		200	{array}		repository.MetricEntry
//	@Failure		401	{object}	ErrorResponse
//	@Failure		500	{object}	ErrorResponse
//	@Router			/api/user/metric-entries [get]
func GetUserMetricEntries(userService services.UserServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		userID := c.Locals("userID").(string)

		metrics, err := userService.GetUserMetricEntries(ctx, userID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.JSON(metrics)
	}
}
