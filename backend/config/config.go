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
	HandlerTimeout          = 10 * time.Second
	TokenExpirationDuration = 24 * time.Hour
	MinPasswordLength       = 8
	MinPasswordLowercase    = 1
	MinPasswordUppercase    = 1
	MinPasswordNumber       = 1
	MinPasswordSpecial      = 2
	ProfileImageSize        = 256
	BannerImageWidth        = 1024
	BannerImageHeight       = 256
)

var (
	JWTSecret        = []byte(os.Getenv("JWT_SECRET_KEY"))
	JWTSigningMethod = jwt.SigningMethodHS256
	Version          string // set at compile time. do not touch
)
