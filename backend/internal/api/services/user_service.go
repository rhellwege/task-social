package services

import (
	"context"

	"github.com/rhellwege/task-social/internal/db/repository"
	"github.com/rhellwege/task-social/internal/util"
)

type UserServicer interface {
	RegisterUser(ctx context.Context, username string, password string, email string) (string, error)
	GetUserDisplay(ctx context.Context, uuid string) (repository.GetUserDisplayRow, error)
	CreateFriend(ctx context.Context, uuid string, friendID string) error
	GetFriends(ctx context.Context, uuid string) ([]repository.GetFriendsRow, error)
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
	// s.a.ValidatePasswordStrength
	hashedPassword, err := s.a.HashPassword(ctx, password)
	if err != nil {
		return "", err
	}

	uuid := util.GenerateUUID()

	params := repository.CreateUserParams{
		ID:       uuid,
		Email:    email,
		Username: username,
		Password: hashedPassword,
	}
	err = s.q.CreateUser(ctx, params)
	if err != nil {
		return "", err
	}
	return params.ID, nil
}

func (s *UserService) GetUserDisplay(ctx context.Context, uuid string) (repository.GetUserDisplayRow, error) {
	return s.q.GetUserDisplay(ctx, uuid)
}

func (s *UserService) CreateFriend(ctx context.Context, uuid string, friendID string) error {
	// Ensure uuid is always the smaller ID to prevent duplicates of a different order
	if uuid > friendID {
		uuid, friendID = friendID, uuid
	}
	params := repository.CreateFriendParams{
		UserID:   uuid,
		FriendID: friendID,
	}
	return s.q.CreateFriend(ctx, params)
}

func (s *UserService) GetFriends(ctx context.Context, uuid string) ([]repository.GetFriendsRow, error) {
	return s.q.GetFriends(ctx, uuid)
}
