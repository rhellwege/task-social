package services

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"time"
	"unicode"

	"github.com/golang-jwt/jwt/v5"
	"github.com/rhellwege/task-social/config"
	"golang.org/x/crypto/bcrypt"
)

type AuthServicer interface {
	// returns nil on success
	ValidatePasswordStrength(ctx context.Context, password string) error
	HashPassword(ctx context.Context, password string) (string, error)
	// returns nil on success
	VerifyPassword(ctx context.Context, password, hashedPassword string) error
	GenerateToken(ctx context.Context, userId string) (string, error)
	VerifyToken(ctx context.Context, tokenString string) (*jwt.Token, error)
}

type AuthService struct{}

// compile time check
var _ AuthServicer = (*AuthService)(nil)

func NewAuthService() *AuthService {
	return &AuthService{}
}

// returns nil on success
func (s *AuthService) ValidatePasswordStrength(ctx context.Context, password string) error {
	if len(password) < config.MinPasswordLength {
		return fmt.Errorf("password is too short, must be at least %d characters", config.MinPasswordLength)
	}
	// count special characters
	count := 0
	for _, char := range password {
		if !unicode.IsLetter(char) && !unicode.IsNumber(char) {
			count++
		}
	}
	if count < config.MinPasswordSpecial {
		return fmt.Errorf("password must contain at least %d special characters", config.MinPasswordSpecial)
	}

	// count uppercase
	count = 0
	for _, char := range password {
		if unicode.IsUpper(char) {
			count++
		}
	}
	if count < config.MinPasswordUppercase {
		return fmt.Errorf("password must contain at least %d uppercase letter", config.MinPasswordUppercase)
	}

	// count lowercase
	count = 0
	for _, char := range password {
		if unicode.IsLower(char) {
			count++
		}
	}
	if count < config.MinPasswordLowercase {
		return fmt.Errorf("password must contain at least %d lowercase letter", config.MinPasswordLowercase)
	}

	// count numbers
	count = 0
	for _, char := range password {
		if unicode.IsNumber(char) {
			count++
		}
	}
	if count < config.MinPasswordNumber {
		return fmt.Errorf("password must contain at least %d number", config.MinPasswordNumber)
	}

	return nil
}

func (s *AuthService) HashPassword(ctx context.Context, password string) (string, error) {
	hashBytes, err := bcrypt.GenerateFromPassword([]byte(password), config.DefaultBcryptHashCost)
	if err != nil {
		return "", err
	}
	textHash := base64.StdEncoding.EncodeToString(hashBytes)
	return textHash, nil
}

func (s *AuthService) GenerateToken(ctx context.Context, userId string) (string, error) {
	token := jwt.NewWithClaims(config.JWTSigningMethod, jwt.MapClaims{
		"sub": userId,
		"exp": time.Now().Add(config.TokenExpirationDuration).Unix(),
	})
	if len(config.JWTSecret) == 0 {
		panic("JWT secret is empty. Set with JWT_SECRET_KEY env variable.")
	}
	return token.SignedString([]byte(config.JWTSecret))
}

func (s *AuthService) VerifyToken(ctx context.Context, tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		if len(config.JWTSecret) == 0 {
			panic("JWT secret is empty. Set with JWT_SECRET_KEY env variable.")
		}
		return []byte(config.JWTSecret), nil
	})
	if err != nil {
		return nil, err
	}
	if token.Method != config.JWTSigningMethod {
		return nil, errors.New("invalid token: incorrect signing method")
	}
	return token, nil
}

// VerifyPassword returns nil on success
func (s *AuthService) VerifyPassword(ctx context.Context, password string, hashedPassword string) error {
	hashedBytes, err := base64.StdEncoding.DecodeString(hashedPassword)
	if err != nil {
		return err
	}
	return bcrypt.CompareHashAndPassword(hashedBytes, []byte(password))
}
