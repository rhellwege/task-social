package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/rhellwege/task-social/internal/api/handlers"
	"github.com/rhellwege/task-social/internal/api/middleware"
	"github.com/rhellwege/task-social/internal/api/services"
	"github.com/rhellwege/task-social/internal/db/repository"
)

func SetupServicesAndRoutes(app *fiber.App, querier repository.Querier) {
	authService := services.NewAuthService()
	userService := services.NewUserService(querier, authService)

	app.Use(requestid.New())
	app.Use(logger.New(logger.Config{
		// For more options, see the Config section
		Format: "${pid} [${ip}]:${port} ${locals:requestid} ${status} - ${method} ${path}​\n",
	}))
	app.Group("/api")
	app.Post("/register", handlers.RegisterUser(userService))
	app.Get("/user/:id", middleware.Authenticated(authService), handlers.GetUser(userService))
}
