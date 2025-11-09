package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/swagger"

	"github.com/go-co-op/gocron/v2"

	"github.com/rhellwege/task-social/config"
	_ "github.com/rhellwege/task-social/docs"
	"github.com/rhellwege/task-social/internal/api/middleware"
	"github.com/rhellwege/task-social/internal/api/routes"
	"github.com/rhellwege/task-social/internal/db"
	"github.com/rhellwege/task-social/internal/db/repository"
)

// @title						Task Social API
// @version					0.1
// @description				API services for the Task Social app
// @host						localhost:5050
// @BasePath					/
//
// @securityDefinitions.apikey	ApiKeyAuth
// @in							header
// @name						Authorization
// @schemes					http
func main() {
	app := fiber.New()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-signalChan
		log.Println("Shutting down the server...")
		cancel()
	}()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Println("WARNING: DATABASE_URL environment variable not set, using default")
		dbURL = config.DefaultDBURL
	}
	log.Printf("Connecting to database at %s..", dbURL)

	config.JWTSecret = []byte(os.Getenv("JWT_SECRET_KEY"))
	if len(config.JWTSecret) == 0 {
		log.Println("WARNING: JWT_SECRET_KEY environment variable not set, using default")
		config.JWTSecret = config.DefaultJWTSecret
	}

	conn, conn_closer, err := db.New(ctx, dbURL)
	if err != nil {
		panic(err)
	}
	defer conn_closer()

	queries := repository.New(conn)

	app.Get("/swagger/*", swagger.HandlerDefault) // default

	port := os.Getenv("PORT")
	if port == "" {
		port = config.DefaultPort
	}
	routes.SetupServicesAndRoutes(app, queries)

	scheduler, err := gocron.NewScheduler()
	if err != nil {
		panic(err)
	}

	scheduler.NewJob(gocron.DurationJob(1*time.Minute), gocron.NewTask(func() {
		err = middleware.CheckMetricsForExpiration(ctx, queries)
		if err != nil {
			panic(err)
		}
	}))

	scheduler.Start()

	serverAddr := fmt.Sprintf(":%s", port)
	go func() {
		log.Printf("Server started on http://127.0.0.1%s\n", serverAddr)

		if err := app.Listen(serverAddr); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	<-ctx.Done()
	log.Println("Server shut down.")
}
