package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/rhellwege/task-social/internal/api/handlers"
	"github.com/rhellwege/task-social/internal/api/middleware"
	"github.com/rhellwege/task-social/internal/api/services"
	"github.com/rhellwege/task-social/internal/db/repository"
)

func SetupServicesAndRoutes(app *fiber.App, querier repository.Querier) {
	authService := services.NewAuthService()
	imageService := services.NewImageService("./assets")
	userService := services.NewUserService(querier, authService, imageService)

	// Logger middleware
	app.Use(logger.New(logger.Config{
		Format: "${time} [${ip}]:${port} ${locals:requestid} ${status} - ${method} ${path} ${error}\n",
	}))

	// Public routes
	app.Get("/api/version", handlers.Version())
	app.Post("/api/register", handlers.RegisterUser(userService))
	app.Post("/api/login", handlers.LoginUser(userService))

	// Protected routes
	api := app.Group("/api", middleware.ProtectedRoute(authService))

	api.Get("/user", handlers.GetUser(userService))
	api.Put("/user", handlers.UpdateUser(userService))

	// Upload profile picture (auth required + middleware)
	api.Post("/user/profile-picture",
		middleware.ImageUploadMiddleware("./assets"),
		handlers.UploadProfilePicture(userService),
	)

	// Serve uploaded assets
	app.Static("/assets", "./assets")
}
