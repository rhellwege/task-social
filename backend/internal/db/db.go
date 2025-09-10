package db

//go:generate sqlc generate

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"os"

	_ "modernc.org/sqlite"
)

func New(ctx context.Context, uri string) (*sql.DB, func(), error) {
	log.Println("Initializing Database")
	if uri == "" {
		return nil, nil, errors.New("DATABASE_URL must be set")
	}

	db, err := sql.Open("sqlite", uri)
	if err != nil {
		return nil, nil, fmt.Errorf("Error opening SQLite database: %v", err)
	}

	if err := db.PingContext(ctx); err != nil {
		return nil, nil, fmt.Errorf("Error connecting to database: %v", err)
	}

	log.Println("Loading Database Schema...")
	schemaBytes, err := os.ReadFile("internal/db/sql/schemas/schema.sql")
	if err != nil {
		return nil, nil, fmt.Errorf("Error reading schema file: %v", err)
	}

	if _, err := db.ExecContext(ctx, string(schemaBytes)); err != nil {
		return nil, nil, fmt.Errorf("Error initializing db schema: %v", err)
	}

	log.Println("Loading Database Triggers...")
	triggersBytes, err := os.ReadFile("internal/db/sql/schemas/triggers.sql")
	if err != nil {
		return nil, nil, fmt.Errorf("Error reading triggers file: %v", err)
	}

	if _, err := db.ExecContext(ctx, string(triggersBytes)); err != nil {
		return nil, nil, fmt.Errorf("Error initializing db triggers: %v", err)
	}

	return db, func() {
		db.Close()
	}, nil
}
