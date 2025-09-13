package services

import (
	"context"
	"testing"

	"github.com/rhellwege/task-social/internal/db"
	"github.com/rhellwege/task-social/internal/db/repository"
)

func TestUserService(t *testing.T) {
	ctx := context.Background()

	// in memory testing db, not full mock
	conn, conn_closer, err := db.New(ctx, ":memory:")
	if err != nil {
		panic(err)
	}
	defer conn_closer()
	queries := repository.New(conn)

}
