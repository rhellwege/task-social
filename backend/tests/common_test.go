package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/rhellwege/task-social/config"
	"github.com/rhellwege/task-social/internal/api/handlers"
	"github.com/rhellwege/task-social/internal/api/routes"
	"github.com/rhellwege/task-social/internal/api/services"
	"github.com/rhellwege/task-social/internal/db"
	"github.com/rhellwege/task-social/internal/db/repository"
)

func NewProtectedRequest(method string, path string, token string, body io.Reader, contentType string) (*http.Request, error) {
	req, err := http.NewRequest(method, path, body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	return req, err
}

func StringToPtr(s string) *string {
	return &s
}

// SetupTestApp creates a new app instance with an in-memory database
func SetupTestApp() *fiber.App {
	// Set JWT secret for tests
	config.JWTSecret = []byte("test-secret-key-for-testing")

	ctx := context.Background()
	conn, _, err := db.New(ctx, ":memory:")
	if err != nil {
		panic(err)
	}

	app := fiber.New()
	querier := repository.New(conn)
	routes.SetupServicesAndRoutes(app, querier)
	return app
}

// CreateTestUser creates a test user and returns the token
func CreateTestUser(app *fiber.App, username, email, password string) (string, error) {
	reqBody := handlers.RegisterUserRequest{
		Username: username,
		Email:    email,
		Password: password,
	}
	jsonBody, _ := json.Marshal(reqBody)
	req, err := http.NewRequest("POST", "/api/register", bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}
	var response handlers.SuccessfulLoginResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", err
	}
	return response.Token, nil
}

// LoginUser logs in a user and returns the token
func LoginUser(app *fiber.App, username *string, email *string, password string) (string, error) {
	reqBody := handlers.LoginUserRequest{
		Email:    email,
		Username: username,
		Password: password,
	}

	jsonBody, _ := json.Marshal(reqBody)
	req, err := http.NewRequest("POST", "/api/login", bytes.NewBuffer(jsonBody))
	if err != nil {
		fmt.Println("Error creating login request:", err)
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("login failed with status %d", resp.StatusCode)
	}

	var loginBody handlers.SuccessfulLoginResponse
	respBody, _ := io.ReadAll(resp.Body)
	json.Unmarshal(respBody, &loginBody)
	return loginBody.Token, nil
}

func CreateTestClub(app *fiber.App, token, name string, description *string, isPublic bool) (*handlers.CreatedResponse, error) {
	reqBody := services.CreateClubRequest{
		Name:        name,
		Description: description,
		IsPublic:    isPublic,
	}
	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}
	req, err := NewProtectedRequest("POST", "/api/club", token, bytes.NewBuffer(jsonBody), "application/json")
	if err != nil {
		return nil, err
	}

	resp, err := app.Test(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("failed to create club: %s", resp.Status)
	}

	var createdResp handlers.CreatedResponse
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	json.Unmarshal(respBody, &createdResp)
	return &createdResp, nil
}
