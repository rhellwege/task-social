package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/rhellwege/task-social/internal/api/handlers"
	"github.com/stretchr/testify/assert"
)

func TestCreateProfilePicture(t *testing.T) {
	app := SetupTestApp()

	// Create a test user
	username := "testuser"
	email := "test@example.com"
	password := "Password123!@"
	_, err := CreateTestUser(app, username, email, password)
	assert.NoError(t, err)

	// Login the test user
	token, err := LoginUser(app, &username, nil, password)
	assert.NoError(t, err)
	assert.NotEmpty(t, token)

	// Upload first profile picture
	_, err = uploadProfilePicture(app, token, "test_assets/testprofile1.jpg")
	assert.NoError(t, err)

	// TODO: Check first profile picture exists

	// Upload second profile picture
	_, err = uploadProfilePicture(app, token, "test_assets/testprofile2.jpg")
	assert.NoError(t, err)

	// TODO: Check first profile picture does not exist

	// TODO: Check second profile picture exists

	// TODO: Remove second profile picture
}

func newProtectedRequestWithType(method string, path string, token string, body io.Reader, contentType string) (*http.Request, error) {
	req, err := http.NewRequest(method, path, body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("Authorization", token)
	return req, err
}

func uploadProfilePicture(app *fiber.App, token, name string) (*handlers.CreatedResponse, error) {
	body, contentType, err := createMultipartFormData(name)
	if err != nil {
		return nil, err
	}
	req, err := newProtectedRequestWithType("POST", "/api/user/profile-picture", token, body, contentType)
	if err != nil {
		return nil, err
	}

	resp, err := app.Test(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to upload profile image: %s", resp.Status)
	}

	var createdResp handlers.CreatedResponse
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	fmt.Println(string(respBody))
	json.Unmarshal(respBody, &createdResp)
	return &createdResp, nil
}

func createMultipartFormData(imagePath string) (*bytes.Buffer, string, error) {
	// Create a buffer to store our multipart data
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Add the file field
	file, err := os.Open(imagePath)
	if err != nil {
		return nil, "", fmt.Errorf("failed to open %s", imagePath)
	}
	defer file.Close()

	part, err := writer.CreateFormFile("image", "test")
	if err != nil {
		return nil, "", err
	}

	// Copy file contents into the multipart part
	if _, err = io.Copy(part, file); err != nil {
		return nil, "", err
	}

	// Close the writer to finalize the form data
	if err = writer.Close(); err != nil {
		return nil, "", err
	}

	// Return body and content type
	return body, writer.FormDataContentType(), nil
}
