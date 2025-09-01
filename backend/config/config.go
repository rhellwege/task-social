package config

import (
	"time"

	"golang.org/x/crypto/bcrypt"
)

const (
	DefaultBcryptHashCost = bcrypt.DefaultCost
	DefaultPort           = "5050"
	DefaultHandlerTimeout = 10 * time.Second
)
