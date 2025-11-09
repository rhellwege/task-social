package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
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
	firstResp, err := uploadProfilePicture(app, token, "test_assets/testprofile.jpg")
	assert.NoError(t, err)
	assert.NotNil(t, firstResp)
	assert.NotEmpty(t, firstResp.URL)

	firstRel := strings.TrimPrefix(firstResp.URL, "/")
	firstPath := filepath.Join("./", firstRel)

	// Check first profile picture exists
	_, err = os.Stat(firstPath)
	assert.NoError(t, err, "first profile picture should exist after upload")

	// Upload second profile picture
	secondResp, err := uploadProfilePicture(app, token, "test_assets/testprofile.png")
	assert.NoError(t, err)
	assert.NotNil(t, secondResp)
	assert.NotEmpty(t, secondResp.URL)

	secondRel := strings.TrimPrefix(secondResp.URL, "/")
	secondPath := filepath.Join("./", secondRel)

	// Check first profile picture does not exist
	_, err = os.Stat(firstPath)
	assert.Error(t, err, "first profile picture should be deleted after second upload")
	assert.True(t, os.IsNotExist(err), "expected first profile picture to be removed")

	// Check second profile picture exists
	_, err = os.Stat(secondPath)
	assert.NoError(t, err, "second profile picture should exist after upload")

	// Upload third profile picture
	thirdResp, err := uploadProfilePicture(app, token, "test_assets/testprofile.webp")
	assert.NoError(t, err)
	assert.NotNil(t, thirdResp)
	assert.NotEmpty(t, thirdResp.URL)

	thirdRel := strings.TrimPrefix(thirdResp.URL, "/")
	thirdPath := filepath.Join("./", thirdRel)

	// Check second profile picture does not exist
	_, err = os.Stat(firstPath)
	assert.Error(t, err, "second profile picture should be deleted after second upload")
	assert.True(t, os.IsNotExist(err), "expected second profile picture to be removed")

	// Check third profile picture exists
	_, err = os.Stat(thirdPath)
	assert.NoError(t, err, "third profile picture should exist after upload")

	// Delete third profile picture
	if err := os.Remove(thirdPath); err != nil && !os.IsNotExist(err) {
		t.Logf("Warning: failed to delete third profile picture: %v", err)
	}
}

func uploadProfilePicture(app *fiber.App, token, name string) (*handlers.UploadProfilePictureResponse, error) {
	body, contentType, err := createMultipartFormData(name)
	if err != nil {
		return nil, err
	}
	req, err := NewProtectedRequest("POST", "/api/user/profile-picture", token, body, contentType)
	if err != nil {
		return nil, err
	}

	resp, err := app.Test(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("failed to upload profile image: %s", resp.Status)
	}

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var createdResp handlers.UploadProfilePictureResponse
	if err := json.Unmarshal(respBody, &createdResp); err != nil {
		return nil, fmt.Errorf("unmarshal failed: %w", err)
	}
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
