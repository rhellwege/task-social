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
		ctx := context.Background()
		authService := NewAuthService()
		password := "password123"

		hashedPassword, err := authService.HashPassword(ctx, password)
		assert.NoError(t, err)
		assert.NotEmpty(t, hashedPassword)

		err = authService.VerifyPassword(ctx, password, hashedPassword)
		assert.NoError(t, err)

		// Test with wrong password
		err = authService.VerifyPassword(ctx, "wrongpassword", hashedPassword)
		assert.Error(t, err)
	})

	t.Run("GenerateToken and VerifyToken", func(t *testing.T) {
		ctx := context.Background()
		authService := NewAuthService()
		userID := "test-user-id"

		token, err := authService.GenerateToken(ctx, userID)
		assert.NoError(t, err)
		assert.NotEmpty(t, token)

		parsedToken, err := authService.VerifyToken(ctx, token)
		assert.NoError(t, err)
		subject, err := parsedToken.Claims.GetSubject()
		assert.NoError(t, err)
		assert.Equal(t, userID, subject)

		// Test with invalid token
		_, err = authService.VerifyToken(ctx, "invalid-token")
		assert.Error(t, err)
	})

	t.Run("Corrupt Token", func(t *testing.T) {
		ctx := context.Background()
		userID := "test-user-id"
		authService := NewAuthService()
		tokenString, err := authService.GenerateToken(ctx, userID)
		assert.NoError(t, err)
		// corrupt the token string
		tokenString = tokenString + "garbage"

		// Verify the token it should fail
		tok, err := authService.VerifyToken(ctx, tokenString)
		assert.Error(t, err)
		assert.Empty(t, tok)
	})

	t.Run("Token expiration", func(t *testing.T) {
		ctx := context.Background()
		authService := NewAuthService()
		// manually sign
		testSub := "testing123-subject"
		// this token expires 1 second in the past
		token := jwt.NewWithClaims(config.JWTSigningMethod, jwt.MapClaims{
			"sub": testSub,
			"exp": time.Now().Add(-1 * time.Second).Unix(),
		})
		tokenString, err := token.SignedString(config.JWTSecret)
		assert.NoError(t, err)

		// Verify the token it should fail
		tok, err := authService.VerifyToken(ctx, tokenString)
		assert.Error(t, err)
		assert.Empty(t, tok)
	})

	t.Run("Password Strength", func(t *testing.T) {
		authService := NewAuthService()
		ctx := context.Background()

		// weak password
		err := authService.ValidatePasswordStrength(ctx, "password")
		assert.Error(t, err)

		err = authService.ValidatePasswordStrength(ctx, "j3U*1)5nO")
		assert.NoError(t, err)

		err = authService.ValidatePasswordStrength(ctx, "2349872835782")
		assert.Error(t, err)

		err = authService.ValidatePasswordStrength(ctx, "*#&$*&#$*@(#98")
		assert.Error(t, err)

		err = authService.ValidatePasswordStrength(ctx, "*#4ricIo0vmMI$0C0wkc940thoncnCNEFHOej0g(&#$*@(#98")
		assert.NoError(t, err)
	})
}
