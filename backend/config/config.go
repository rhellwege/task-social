package config

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const (
	DefaultBcryptHashCost   = bcrypt.DefaultCost
	DefaultPort             = "5050"
	DefaultDBURL            = "./test.sqlite"
	HandlerTimeout          = 10 * time.Second
	TokenExpirationDuration = 24 * time.Hour
	MetricCheckPeriod       = 1 * time.Minute
	MinPasswordLength       = 8
	MinPasswordLowercase    = 1
	MinPasswordUppercase    = 1
	MinPasswordNumber       = 1
	MinPasswordSpecial      = 2
	ProfileImageSize        = 256
	ProfileImageSubDir      = "assets/profile"
	BannerImageWidth        = 1024
	BannerImageHeight       = 256
	BannerImageSubDir       = "assets/banner"
)

var (
	DefaultJWTSecret = []byte("secret")
	JWTSecret        []byte // env: JWT_SECRET_KEY or config.DefaultJWTSecret
	JWTSigningMethod = jwt.SigningMethodHS256
	Version          string // set at compile time. do not touch
	CommitHash       string // set at compile time. do not touch
	BuildDate        string // set at compile time. do not touch
	DBURL            string // env: DATABASE_URL or config.DefaultDBURL
)
