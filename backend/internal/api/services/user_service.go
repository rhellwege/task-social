package services

import (
	"context"
	"errors"

	"github.com/rhellwege/task-social/internal/db/repository"
	"github.com/rhellwege/task-social/internal/util"
)

type UserServicer interface {
	RegisterUser(ctx context.Context, username string, email string, password string) (string, error)
	// either username or email is required
	LoginUser(ctx context.Context, username *string, email *string, password string) (string, error)
	GetUserDisplay(ctx context.Context, userID string) (repository.GetUserDisplayRow, error)
	CreateFriend(ctx context.Context, userID string, friendID string) error
	GetFriends(ctx context.Context, userID string) ([]repository.GetFriendsRow, error)
	UpdateUser(ctx context.Context, params repository.UpdateUserParams) error
}

type UserService struct {
	q repository.Querier
	a AuthServicer
}

// compile time interface implementation check
var _ UserServicer = (*UserService)(nil)

func NewUserService(q repository.Querier, a AuthServicer) *UserService {
	return &UserService{
		q: q,
		a: a,
	}
}

func (s *UserService) RegisterUser(ctx context.Context, username string, password string, email string) (string, error) {
	// password check
	err := s.a.ValidatePasswordStrength(ctx, password)
	if err != nil {
		return "", err
	}
	hashedPassword, err := s.a.HashPassword(ctx, password)
	if err != nil {
		return "", err
	}

	userID := util.GenerateUUID()

	params := repository.CreateUserParams{
		ID:       userID,
		Email:    email,
		Username: username,
		Password: hashedPassword,
	}
	err = s.q.CreateUser(ctx, params)
	if err != nil {
		return "", err
	}

	tokenString, err := s.a.GenerateToken(ctx, userID)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// either username or email is required
func (s *UserService) LoginUser(ctx context.Context, username *string, email *string, password string) (string, error) {
	var hashedPassword string
	var userID string
	var err error

	if username == nil && email == nil {
		return "", errors.New("username or email is required")
	}

	if username != nil {
		login, e := s.q.GetUserLoginByUsername(ctx, *username)
		hashedPassword = login.Password
		userID = login.ID
		err = e
	} else if email != nil {
		login, e := s.q.GetUserLoginByEmail(ctx, *email)
		hashedPassword = login.Password
		userID = login.ID
		err = e
	}
	if err != nil {
		return "", errors.New("Could not find user with provided credentials")
	}

	if err := s.a.VerifyPassword(ctx, password, hashedPassword); err != nil {
		return "", err
	}

	tokenString, err := s.a.GenerateToken(ctx, userID)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func (s *UserService) GetUserDisplay(ctx context.Context, userID string) (repository.GetUserDisplayRow, error) {
	return s.q.GetUserDisplay(ctx, userID)
}

func (s *UserService) CreateFriend(ctx context.Context, userID string, friendID string) error {
	// Ensure uuid is always the smaller ID to prevent duplicates of a different order
	if userID > friendID {
		userID, friendID = friendID, userID
	}
	params := repository.CreateFriendParams{
		UserID:   userID,
		FriendID: friendID,
	}
	return s.q.CreateFriend(ctx, params)
}

func (s *UserService) GetFriends(ctx context.Context, uuid string) ([]repository.GetFriendsRow, error) {
	return s.q.GetFriends(ctx, uuid)
}

func (s *UserService) UpdateUser(ctx context.Context, params repository.UpdateUserParams) error {
	// hash new password if provided
	if params.Password != nil {
		err := s.a.ValidatePasswordStrength(ctx, *params.Password)
		if err != nil {
			return err
		}
		hashed, err := s.a.HashPassword(ctx, *params.Password)
		if err != nil {
			return err
		}
		params.Password = &hashed
	}

	return s.q.UpdateUser(ctx, params)
}
