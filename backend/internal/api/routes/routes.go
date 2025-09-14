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
	userService := services.NewUserService(querier, authService)
	clubService := services.NewClubService(querier)

	app.Use(logger.New(logger.Config{
		// For more options, see the Config section
		Format: "${time} [${ip}]:${port} ${status} - ${method} ${path} ${error}​\n",
	}))
	app.Get("/api/version", handlers.Version())
	app.Post("/api/register", handlers.RegisterUser(userService))
	app.Post("/api/login", handlers.LoginUser(userService))
	// Authenticated / Authorized routes:
	app.Group("/api", middleware.ProtectedRoute(authService))
	app.Get("/api/user", handlers.GetUser(userService))
	app.Put("/api/user", handlers.UpdateUser(userService))
	app.Get("/api/user/clubs", handlers.GetUserClubs(userService))

	app.Post("/api/club", handlers.CreateClub(clubService))
	app.Get("/api/clubs", handlers.GetPublicClubs(clubService))
	app.Post("/api/club/:club_id/join", handlers.JoinClub(clubService))
	app.Post("/api/club/:club_id/leave", handlers.LeaveClub(clubService))
	app.Delete("/api/club/:club_id", handlers.DeleteClub(clubService))
	app.Put("/api/club/:club_id", handlers.UpdateClub(clubService))
	app.Get("/api/club/:club_id/leaderboard", handlers.GetClubLeaderboard(clubService))
}
