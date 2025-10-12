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
	clubService := services.NewClubService(querier, imageService)
	metricService := services.NewMetricService(querier, clubService)

	// Logger middleware
	app.Use(logger.New(logger.Config{
		Format: "${time} [${ip}]:${port} ${locals:requestid} ${status} - ${method} ${path} ${latency} \n",
	}))

	// Public routes
	app.Get("/api/version", handlers.Version())
	app.Post("/api/register", handlers.RegisterUser(userService))
	app.Post("/api/login", handlers.LoginUser(userService))

	// Protected routes
	api := app.Group("/api", middleware.ProtectedRoute(authService))

	// User routes
	api.Get("/user", handlers.GetUser(userService))
	api.Put("/user", handlers.UpdateUser(userService))
	api.Get("/user/clubs", handlers.GetUserClubs(userService))
	api.Post("/user/profile-picture",
		middleware.ImageUploadMiddleware("./assets"),
		handlers.UploadProfilePicture(userService),
	)
	// returns all metrics from all joined clubs
	api.Get("/user/metrics", handlers.GetUserMetrics(userService))
	// returns all of the user's metric entries
	api.Get("user/metric-entries", handlers.GetUserMetricEntries(userService))

	// Club routes
	api.Post("/club", handlers.CreateClub(clubService))
	api.Get("/clubs", handlers.GetPublicClubs(clubService))
	api.Post("/club/:club_id/join", handlers.JoinClub(clubService))
	api.Post("/club/:club_id/leave", handlers.LeaveClub(clubService))
	api.Get("/club/:club_id", handlers.GetClub(clubService))
	api.Delete("/club/:club_id", handlers.DeleteClub(clubService))
	api.Put("/club/:club_id", handlers.UpdateClub(clubService))
	api.Get("/club/:club_id/leaderboard", handlers.GetClubLeaderboard(clubService))
	api.Post("/club/:club_id/banner",
		middleware.ImageUploadMiddleware("./assets"),
		handlers.UploadClubBanner(clubService),
	)
	api.Get("/club/:club_id/metrics", handlers.GetClubMetrics(clubService))

	// Metrics routes
	api.Post("/metric", handlers.CreateMetric(metricService))
	api.Get("/metric/:metric_id", handlers.GetMetric(metricService))
	api.Put("/metric/:metric_id", handlers.UpdateMetric(metricService))
	api.Delete("/metric/:metric_id", handlers.DeleteMetric(metricService))
	// turn in a metric to the current instance
	api.Post("/metric/:metric_id/entry", handlers.CreateMetricEntry(metricService))
	// gets the latest entries
	api.Get("/metric/:metric_id/latest-entries", handlers.GetLatestMetricEntries(metricService))
	// gets all historical entries of a metric
	api.Get("/metric/:metric_id/historical-entries", handlers.GetHistoricalMetricEntries(metricService))

	// Serve uploaded assets
	app.Static("/assets", "./assets")
}
