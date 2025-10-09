package services

import (
	"context"
	"encoding/json"
	"errors"
	"path/filepath"

	"github.com/rhellwege/task-social/config"
	"github.com/rhellwege/task-social/internal/db/repository"
	"github.com/rhellwege/task-social/internal/util"
)

type ClubServicer interface {
	CreateClub(ctx context.Context, userID string, params CreateClubRequest) (string, error)
	GetClub(ctx context.Context, userID string, clubID string) (repository.Club, error)
	GetPublicClubs(ctx context.Context) ([]repository.Club, error)
	JoinClub(ctx context.Context, userID string, clubID string, isModerator bool) error
	LeaveClub(ctx context.Context, params repository.DeleteClubMembershipParams) error
	GetClubLeaderboard(ctx context.Context, userID string, clubID string) ([]repository.GetClubLeaderboardRow, error)
	DeleteClub(ctx context.Context, userID string, clubID string) error
	UpdateClub(ctx context.Context, userID string, params repository.UpdateClubParams) error
	UploadClubBanner(ctx context.Context, clubID string, fileBytes []byte) (string, error)
	GetClubMetrics(ctx context.Context, userID string, clubID string) ([]repository.Metric, error)
	GetClubPosts(ctx context.Context, userID string, clubID string) ([]repository.ClubPost, error)
	CreateClubPost(ctx context.Context, userID string, clubID string, text string) (string, error)
}

type ClubService struct {
	q repository.Querier
	i ImageServicer
	w WebSocketServicer
}

// compile time assertion that ClubService implements ClubServicer
var _ ClubServicer = (*ClubService)(nil)

func NewClubService(q repository.Querier, i ImageServicer, w WebSocketServicer) *ClubService {
	return &ClubService{q: q, i: i, w: w}
}

type CreateClubRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description,omitempty"`
	BannerImage *string `json:"banner_image,omitempty"`
	IsPublic    bool    `json:"is_public"`
}

func (s *ClubService) CreateClub(ctx context.Context, userID string, params CreateClubRequest) (string, error) {
	clubID := util.GenerateUUID()
	dbParams := repository.CreateClubParams{
		ID:          clubID,
		Name:        params.Name,
		Description: params.Description,
		BannerImage: params.BannerImage,
		IsPublic:    params.IsPublic,
		OwnerUserID: userID,
	}
	err := s.q.CreateClub(ctx, dbParams)
	if err != nil {
		return "", err
	}
	// implicitly join club
	err = s.JoinClub(ctx, userID, clubID, true)
	if err != nil {
		return "", err
	}
	return clubID, nil
}

func (s *ClubService) GetClub(ctx context.Context, userID string, clubID string) (repository.Club, error) {
	club, err := s.q.GetClub(ctx, clubID)
	if err != nil {
		return repository.Club{}, err
	}

	member, err := s.IsUserMemberOfClub(ctx, userID, clubID)
	if err != nil {
		return repository.Club{}, err
	}

	if !member && !club.IsPublic {
		return repository.Club{}, errors.New("Permission denied: user is not a member of this private club")
	}

	return club, nil
}

func (s *ClubService) GetPublicClubs(ctx context.Context) ([]repository.Club, error) {
	return s.q.GetPublicClubs(ctx)
}

func (s *ClubService) JoinClub(ctx context.Context, userID string, clubID string, isModerator bool) error {
	return s.q.CreateClubMembership(ctx, repository.CreateClubMembershipParams{
		UserID:      userID,
		ClubID:      clubID,
		IsModerator: isModerator,
	})
}

func (s *ClubService) LeaveClub(ctx context.Context, params repository.DeleteClubMembershipParams) error {
	return s.q.DeleteClubMembership(ctx, params)
}

func (s *ClubService) IsUserMemberOfClub(ctx context.Context, userID string, clubID string) (bool, error) {
	params := repository.IsUserMemberOfClubParams{
		UserID: userID,
		ClubID: clubID,
	}
	ret, err := s.q.IsUserMemberOfClub(ctx, params)
	return (ret != 0), err
}

func (s *ClubService) IsUserModeratorOfClub(ctx context.Context, userID string, clubID string) (bool, error) {
	params := repository.IsUserModeratorOfClubParams{
		UserID: userID,
		ClubID: clubID,
	}
	ret, err := s.q.IsUserModeratorOfClub(ctx, params)
	return (ret != 0), err
}

func (s *ClubService) IsUserOwnerOfClub(ctx context.Context, userID string, clubID string) (bool, error) {
	params := repository.IsUserOwnerOfClubParams{
		UserID: userID,
		ClubID: clubID,
	}
	ret, err := s.q.IsUserOwnerOfClub(ctx, params)
	return (ret != 0), err
}

func (s *ClubService) GetClubLeaderboard(ctx context.Context, userID string, clubID string) ([]repository.GetClubLeaderboardRow, error) {
	isMember, err := s.IsUserMemberOfClub(ctx, userID, clubID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, errors.New("Permission denied: user is not a member of the club")
	}
	return s.q.GetClubLeaderboard(ctx, clubID)
}

func (s *ClubService) DeleteClub(ctx context.Context, userID string, clubID string) error {
	isOwner, err := s.IsUserOwnerOfClub(ctx, userID, clubID)
	if err != nil {
		return err
	}
	if !isOwner {
		return errors.New("Permission denied: user is not the owner of the club")
	}
	return s.q.DeleteClub(ctx, clubID)
}

func (s *ClubService) UpdateClub(ctx context.Context, userID string, params repository.UpdateClubParams) error {
	club, err := s.q.GetClub(ctx, params.ID)
	if err != nil {
		return err
	}

	if club.OwnerUserID != userID {
		return errors.New("Permission denied: user is not the owner of the club")
	}

	return s.q.UpdateClub(ctx, params)
}

func (s *ClubService) UploadClubBanner(ctx context.Context, clubID string, fileBytes []byte) (string, error) {
	// 1. Get existing banner
	club, err := s.q.GetClub(ctx, clubID)
	if err != nil {
		return "", err
	}

	// 2. Delete old banner if exists
	if club.BannerImage != nil && *club.BannerImage != "" {
		filename := filepath.Base(*club.BannerImage)
		s.i.DeleteImage("banner", filename)
	}

	// 3. Save new banner
	url, err := s.i.SaveImage(ctx, fileBytes, config.BannerImageWidth, config.BannerImageHeight, "banner")
	if err != nil {
		return "", err
	}

	// 4. Update DB
	params := repository.UpdateClubParams{
		ID:          clubID,
		BannerImage: &url,
	}
	if err := s.q.UpdateClub(ctx, params); err != nil {
		return "", err
	}

	return url, nil
}

func (s *ClubService) GetClubMetrics(ctx context.Context, userID string, clubID string) ([]repository.Metric, error) {
	isMember, err := s.IsUserMemberOfClub(ctx, userID, clubID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, errors.New("Permission denied: user is not a member of the club")
	}
	return s.q.GetClubMetrics(ctx, clubID)
}

func (s *ClubService) GetClubPosts(ctx context.Context, userID string, clubID string) ([]repository.ClubPost, error) {
	return s.q.GetClubPosts(ctx, clubID)
}

func (s *ClubService) CreateClubPost(ctx context.Context, userID string, clubID string, text string) (string, error) {
	id := util.GenerateUUID()
	params := repository.CreateClubPostParams{
		ID:      id,
		UserID:  userID,
		ClubID:  clubID,
		Content: text,
	}
	err := s.q.CreateClubPost(ctx, params)
	if err != nil {
		return "", err
	}
	post, err := s.q.GetClubPost(ctx, id)
	if err != nil {
		return "", err
	}
	jsonStr, err := json.Marshal(post)
	if err != nil {
		return "", err
	}

	users, err := s.q.GetClubUserIds(ctx, clubID)
	if err != nil {
		return "", err
	}
	s.w.BroadcastMessage(ctx, users, string(jsonStr))
	return id, nil
}
