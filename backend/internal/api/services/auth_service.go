package services

import (
	"context"
	"encoding/base64"

	"github.com/rhellwege/task-social/config"
	"golang.org/x/crypto/bcrypt"
)

type AuthServicer interface {
	// ValidatePasswordStrength(ctx context.Context, password string) bool
	HashPassword(ctx context.Context, password string) (string, error)
	VerifyPassword(ctx context.Context, password, hashedPassword string) error
	// GenerateToken(ctx context.Context, userId string) (string, error)
	// VerifyToken(ctx context.Context, token string) (bool, error)
}

type AuthService struct{}

// compile time check
var _ AuthServicer = (*AuthService)(nil)

// NewAuthService creates a new instance of AuthService
func NewAuthService() *AuthService {
	return &AuthService{}
}

func (s *AuthService) HashPassword(ctx context.Context, password string) (string, error) {
	hashBytes, err := bcrypt.GenerateFromPassword([]byte(password), config.DefaultBcryptHashCost)
	if err != nil {
		return "", err
	}
	textHash := base64.StdEncoding.EncodeToString(hashBytes)
	return textHash, nil
}

// VerifyPassword returns nil on success
func (s *AuthService) VerifyPassword(ctx context.Context, password, hashedPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
