package config

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const (
	DefaultBcryptHashCost   = bcrypt.DefaultCost
	DefaultPort             = "5050"
	DefaultHandlerTimeout   = 10 * time.Second
	MinPasswordLength       = 8
	TokenExpirationDuration = 24 * time.Hour
)

var (
	JWTSecret        = []byte(os.Getenv("JWT_SECRET_KEY"))
	JWTSigningMethod = jwt.SigningMethodHS256
	Version          string // compile variable do not touch
)
