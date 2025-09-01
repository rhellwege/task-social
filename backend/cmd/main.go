package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/swagger"

	// generated docs `swag init -g cmd/main.go`
	"github.com/rhellwege/task-social/config"
	_ "github.com/rhellwege/task-social/docs"
	"github.com/rhellwege/task-social/internal/api/routes"
	"github.com/rhellwege/task-social/internal/db"
	"github.com/rhellwege/task-social/internal/db/repository"
)

// @title			Task Social API
// @version		0.1
// @description	API services for the Task Social app
// @host			localhost:5050
// @BasePath		/
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
