package services

import (
	"context"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/rhellwege/task-social/config"
	"github.com/stretchr/testify/assert"
)

func TestAuthService(t *testing.T) {
	config.JWTSecret = []byte("test-secret")
	t.Run("HashPassword and VerifyPassword", func(t *testing.T) {
		authService := NewAuthService()
		ctx := context.Background()

		testCases := []struct {
			name              string
			password          string
			wrongPassword     string
			expectedHashErr   bool
			expectedVerifyErr bool
		}{
			{
				name:              "Valid password",
				password:          "password123",
				wrongPassword:     "wrongpassword",
				expectedHashErr:   false,
				expectedVerifyErr: false,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				hashedPassword, err := authService.HashPassword(ctx, tc.password)
				if tc.expectedHashErr {
					assert.Error(t, err)
					return
				}

				assert.NoError(t, err)
				assert.NotEmpty(t, hashedPassword)

				err = authService.VerifyPassword(ctx, tc.password, hashedPassword)
				if tc.expectedVerifyErr {
					assert.Error(t, err)
				} else {
					assert.NoError(t, err)
				}

				// Test with wrong password
				err = authService.VerifyPassword(ctx, tc.wrongPassword, hashedPassword)
				assert.Error(t, err)
			})
		}
	})

	t.Run("GenerateToken and VerifyToken", func(t *testing.T) {
		authService := NewAuthService()
		ctx := context.Background()

		testCases := []struct {
			name          string
			userID        string
			expectedError bool
		}{
			{
				name:          "Valid user ID",
				userID:        "test-user-id",
				expectedError: false,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				token, err := authService.GenerateToken(ctx, tc.userID)
				if tc.expectedError {
					assert.Error(t, err)
					return
				}

				assert.NoError(t, err)
				assert.NotEmpty(t, token)

				parsedToken, err := authService.VerifyToken(ctx, token)
				assert.NoError(t, err)

				subject, err := parsedToken.Claims.GetSubject()
				assert.NoError(t, err)
				assert.Equal(t, tc.userID, subject)
			})
		}
	})

	t.Run("Corrupt Token", func(t *testing.T) {
		authService := NewAuthService()
		ctx := context.Background()
		userID := "test-user-id"

		tokenString, err := authService.GenerateToken(ctx, userID)
		assert.NoError(t, err)

		testCases := []struct {
			name          string
			token         string
			expectedError bool
		}{
			{
				name:          "Corrupt token",
				token:         tokenString + "garbage",
				expectedError: true,
			},
			{
				name:          "Invalid token",
				token:         "invalid-token",
				expectedError: true,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				_, err := authService.VerifyToken(ctx, tc.token)
				if tc.expectedError {
					assert.Error(t, err)
				} else {
					assert.NoError(t, err)
				}
			})
		}
	})

	t.Run("Token expiration", func(t *testing.T) {
		authService := NewAuthService()
		ctx := context.Background()

		testCases := []struct {
			name          string
			token         *jwt.Token
			expectedError bool
		}{
			{
				name: "Expired token",
				token: jwt.NewWithClaims(config.JWTSigningMethod, jwt.MapClaims{
					"sub": "test-subject",
					"exp": time.Now().Add(-1 * time.Second).Unix(),
				}),
				expectedError: true,
			},
			{
				name: "Valid token",
				token: jwt.NewWithClaims(config.JWTSigningMethod, jwt.MapClaims{
					"sub": "test-subject",
					"exp": time.Now().Add(1 * time.Hour).Unix(),
				}),
				expectedError: false,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				tokenString, err := tc.token.SignedString(config.JWTSecret)
				assert.NoError(t, err)

				_, err = authService.VerifyToken(ctx, tokenString)
				if tc.expectedError {
					assert.Error(t, err)
				} else {
					assert.NoError(t, err)
				}
			})
		}
	})

	t.Run("Password Strength", func(t *testing.T) {
		authService := NewAuthService()
		ctx := context.Background()

		testCases := []struct {
			name          string
			password      string
			expectedError bool
		}{
			{
				name:          "Weak password - too short",
				password:      "pass",
				expectedError: true,
			},
			{
				name:          "Weak password - only letters",
				password:      "password",
				expectedError: true,
			},
			{
				name:          "Weak password - only numbers",
				password:      "123456789",
				expectedError: true,
			},
			{
				name:          "Weak password - only symbols",
				password:      "!@#$%^&*",
				expectedError: true,
			},
			{
				name:          "Strong password",
				password:      "j3U*1)5nO",
				expectedError: false,
			},
			{
				name:          "Strong password - long",
				password:      "*#4ricIo0vmMI$0C0wkc940thoncnCNEFHOej0g(&#$*@(#98",
				expectedError: false,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				err := authService.ValidatePasswordStrength(ctx, tc.password)
				if tc.expectedError {
					assert.Error(t, err)
				} else {
					assert.NoError(t, err)
				}
			})
		}
	})
}
