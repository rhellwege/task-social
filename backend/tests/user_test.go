package tests

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"testing"

	"github.com/rhellwege/task-social/internal/api/handlers"
	"github.com/rhellwege/task-social/internal/db/repository"
	"github.com/stretchr/testify/assert"
)

func TestRegisterUser(t *testing.T) {
	testCases := []struct {
		name               string
		requestBody        handlers.RegisterUserRequest
		expectedStatusCode int
	}{
		{
			name: "Valid registration",
			requestBody: handlers.RegisterUserRequest{
				Username: "validuser1",
				Email:    "valid1@example.com",
				Password: "Password123!@",
			},
			expectedStatusCode: http.StatusCreated,
		},
		{
			name: "Weak password",
			requestBody: handlers.RegisterUserRequest{
				Username: "validuser2",
				Email:    "valid2@example.com",
				Password: "weak",
			},
			expectedStatusCode: http.StatusInternalServerError,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			app := SetupTestApp() // Fresh app for each test case

			jsonBody, _ := json.Marshal(tc.requestBody)
			req, _ := http.NewRequest("POST", "/api/register", bytes.NewBuffer(jsonBody))
			req.Header.Set("Content-Type", "application/json")

			resp, err := app.Test(req)
			assert.NoError(t, err)
			assert.Equal(t, tc.expectedStatusCode, resp.StatusCode)

			if resp.StatusCode == http.StatusCreated {
				var body handlers.SuccessfulLoginResponse
				respBody, _ := io.ReadAll(resp.Body)
				json.Unmarshal(respBody, &body)
				assert.NotEmpty(t, body.Token)
			}
		})
	}
}

func TestRegisterUserDuplicates(t *testing.T) {
	app := SetupTestApp()

	// Create initial user
	_, err := CreateTestUser(app, "testuser", "test@example.com", "Password123!@")
	assert.NoError(t, err)

	t.Run("Duplicate username", func(t *testing.T) {
		_, err := CreateTestUser(app, "testuser", "different@example.com", "Password123!@")
		assert.Error(t, err)
	})

	t.Run("Duplicate email", func(t *testing.T) {
		_, err := CreateTestUser(app, "differentuser", "test@example.com", "Password123!@")
		assert.Error(t, err)
	})
}

func TestLoginUser(t *testing.T) {
	testCases := []struct {
		name               string
		setupUser          bool
		username           string
		email              string
		password           string
		loginUsername      *string
		loginEmail         *string
		loginPassword      string
		expectedStatusCode int
	}{
		{
			name:               "Valid login with username",
			setupUser:          true,
			username:           "loginuser1",
			email:              "login1@example.com",
			password:           "Password123!@",
			loginUsername:      stringPtr("loginuser1"),
			loginPassword:      "Password123!@",
			expectedStatusCode: http.StatusOK,
		},
		{
			name:               "Valid login with email",
			setupUser:          true,
			username:           "loginuser2",
			email:              "login2@example.com",
			password:           "Password123!@",
			loginEmail:         stringPtr("login2@example.com"),
			loginPassword:      "Password123!@",
			expectedStatusCode: http.StatusOK,
		},
		{
			name:               "Invalid password",
			setupUser:          true,
			username:           "loginuser3",
			email:              "login3@example.com",
			password:           "Password123!@",
			loginUsername:      stringPtr("loginuser3"),
			loginPassword:      "wrongpassword",
			expectedStatusCode: http.StatusUnauthorized,
		},
		{
			name:               "User not found",
			setupUser:          false,
			loginUsername:      stringPtr("nonexistentuser"),
			loginPassword:      "Password123!@",
			expectedStatusCode: http.StatusUnauthorized,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			app := SetupTestApp() // Fresh app for each test case

			// Setup user if needed
			if tc.setupUser {
				_, err := CreateTestUser(app, tc.username, tc.email, tc.password)
				assert.NoError(t, err)
			}

			// Perform login
			var reqBody handlers.LoginUserRequest
			if tc.loginUsername != nil {
				reqBody.Username = tc.loginUsername
			}
			if tc.loginEmail != nil {
				reqBody.Email = tc.loginEmail
			}
			reqBody.Password = tc.loginPassword

			jsonBody, _ := json.Marshal(reqBody)
			log.Println(string(jsonBody))
			req, _ := http.NewRequest("POST", "/api/login", bytes.NewBuffer(jsonBody))
			req.Header.Set("Content-Type", "application/json")

			resp, err := app.Test(req)
			assert.NoError(t, err)
			assert.Equal(t, tc.expectedStatusCode, resp.StatusCode)

			if resp.StatusCode == http.StatusOK {
				var body handlers.SuccessfulLoginResponse
				respBody, _ := io.ReadAll(resp.Body)
				json.Unmarshal(respBody, &body)
				assert.NotEmpty(t, body.Token)
			}
		})
	}
}

func TestGetUser(t *testing.T) {
	testCases := []struct {
		name               string
		setupUser          bool
		username           string
		email              string
		password           string
		useValidToken      bool
		customToken        string
		expectedStatusCode int
		expectedUsername   string
	}{
		{
			name:               "Valid token",
			setupUser:          true,
			username:           "getuser1",
			email:              "getuser1@example.com",
			password:           "Password123!@",
			useValidToken:      true,
			expectedStatusCode: http.StatusOK,
			expectedUsername:   "getuser1",
		},
		{
			name:               "Invalid token",
			setupUser:          false,
			customToken:        "invalidtoken",
			expectedStatusCode: http.StatusUnauthorized,
		},
		{
			name:               "No token",
			setupUser:          false,
			expectedStatusCode: http.StatusUnauthorized,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			app := SetupTestApp() // Fresh app for each test case

			var token string
			if tc.setupUser {
				// Create user
				_, err := CreateTestUser(app, tc.username, tc.email, tc.password)
				assert.NoError(t, err)

				if tc.useValidToken {
					// Get token
					token, err = LoginUser(app, &tc.username, nil, tc.password)
					assert.NoError(t, err)
					assert.NotEmpty(t, token)
				}
			}

			if tc.customToken != "" {
				token = tc.customToken
			}

			// Make request
			req, _ := http.NewRequest("GET", "/api/user", nil)
			if token != "" {
				req.Header.Set("Authorization", token)
			}

			resp, err := app.Test(req)
			assert.NoError(t, err)
			assert.Equal(t, tc.expectedStatusCode, resp.StatusCode)

			if resp.StatusCode == http.StatusOK {
				var userBody repository.GetUserDisplayRow
				respBody, _ := io.ReadAll(resp.Body)
				json.Unmarshal(respBody, &userBody)
				assert.Equal(t, tc.expectedUsername, userBody.Username)
			}
		})
	}
}

func TestUpdateUser(t *testing.T) {
	testCases := []struct {
		name               string
		setupUser          bool
		username           string
		email              string
		password           string
		useValidToken      bool
		customToken        string
		updateRequest      handlers.UpdateUserRequest
		expectedStatusCode int
	}{
		{
			name:          "Valid update",
			setupUser:     true,
			username:      "updateuser1",
			email:         "updateuser1@example.com",
			password:      "Password123!@",
			useValidToken: true,
			updateRequest: handlers.UpdateUserRequest{
				Username: stringPtr("newusername1"),
			},
			expectedStatusCode: http.StatusOK,
		},
		{
			name:        "Invalid token",
			setupUser:   false,
			customToken: "invalidtoken",
			updateRequest: handlers.UpdateUserRequest{
				Username: stringPtr("newusername2"),
			},
			expectedStatusCode: http.StatusUnauthorized,
		},
		{
			name:      "No token",
			setupUser: false,
			updateRequest: handlers.UpdateUserRequest{
				Username: stringPtr("newusername3"),
			},
			expectedStatusCode: http.StatusUnauthorized,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			app := SetupTestApp() // Fresh app for each test case

			var token string
			if tc.setupUser {
				// Create user
				_, err := CreateTestUser(app, tc.username, tc.email, tc.password)
				assert.NoError(t, err)

				if tc.useValidToken {
					// Get token
					token, err = LoginUser(app, &tc.username, nil, tc.password)
					assert.NoError(t, err)
					assert.NotEmpty(t, token)
				}
			}

			if tc.customToken != "" {
				token = tc.customToken
			}

			// Make update request
			jsonBody, _ := json.Marshal(tc.updateRequest)
			req, _ := http.NewRequest("PUT", "/api/user", bytes.NewBuffer(jsonBody))
			req.Header.Set("Content-Type", "application/json")
			if token != "" {
				req.Header.Set("Authorization", token)
			}

			resp, err := app.Test(req)
			assert.NoError(t, err)
			assert.Equal(t, tc.expectedStatusCode, resp.StatusCode)
		})
	}
}

func stringPtr(s string) *string {
	return &s
}
