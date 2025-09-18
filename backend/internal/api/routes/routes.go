package routes

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/rhellwege/task-social/internal/api/handlers"
	"github.com/rhellwege/task-social/internal/api/middleware"
	"github.com/rhellwege/task-social/internal/api/services"
	"github.com/rhellwege/task-social/internal/db/repository"
)

func SetupServicesAndRoutes(app *fiber.App, querier repository.Querier) {
	authService := services.NewAuthService()
	userService := services.NewUserService(querier, authService)
	clubService := services.NewClubService(querier)

	// Custom CORS middleware to force headers
	app.Use(func(c *fiber.Ctx) error {
		origin := c.Get("Origin")
		allowedOrigin := "http://localhost:19006"
		if origin == "http://localhost:19006" || origin == "http://localhost:8081" || origin == "http://127.0.0.1:19006" {
			allowedOrigin = origin
		}
		fmt.Println("Setting CORS for:", c.Path(), "Origin:", origin, "Allowed:", allowedOrigin)
		c.Set("Access-Control-Allow-Origin", allowedOrigin)
		c.Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
		if c.Method() == "OPTIONS" {
			return c.SendStatus(fiber.StatusNoContent)
		}
		return c.Next()
	})

	app.Use(logger.New(logger.Config{
		Format: "${time} [${ip}]:${port} ${status} - ${method} ${path} ${error}\n",
	}))

	// Public Routes
	app.Get("/api/version", handlers.Version())
	app.Post("/api/register", handlers.RegisterUser(userService))
	app.Post("/api/login", handlers.LoginUser(userService))

	// Protected Routes
	api := app.Group("/api", middleware.ProtectedRoute(authService))
	api.Get("/user", handlers.GetUser(userService))
	api.Put("/user", handlers.UpdateUser(userService))
	api.Get("/user/clubs", handlers.GetUserClubs(userService))

	api.Post("/club", handlers.CreateClub(clubService))
	api.Get("/clubs", handlers.GetPublicClubs(clubService))
	api.Post("/club/:club_id/join", handlers.JoinClub(clubService))
	api.Post("/club/:club_id/leave", handlers.LeaveClub(clubService))
	api.Delete("/club/:club_id", handlers.DeleteClub(clubService))
	api.Put("/club/:club_id", handlers.UpdateClub(clubService))
	api.Get("/club/:club_id/leaderboard", handlers.GetClubLeaderboard(clubService))
}
