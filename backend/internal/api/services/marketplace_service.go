package services

import (
	"context"
	"errors"

	"github.com/rhellwege/task-social/internal/db/repository"
	"github.com/rhellwege/task-social/internal/util"
)

type MarketplaceServicer interface {
	CreateItem(ctx context.Context, userID string, req CreateItemRequest) (string, error)
	UpdateItem(ctx context.Context, userID string, params repository.UpdateItemParams) error
	DeleteItem(ctx context.Context, userID string, itemID string) error

	GetClubItems(ctx context.Context, userID string, clubID string) ([]ClubMarketplaceItem, error)
	CreateClubItem(ctx context.Context, userID string, clubID string, req CreateItemRequest) (string, error)
}

type MarketplaceService struct {
	q repository.Querier
}

// compile-time assertion
var _ MarketplaceServicer = (*MarketplaceService)(nil)

func NewMarketplaceService(q repository.Querier) *MarketplaceService {
	return &MarketplaceService{q: q}
}

/* ============================
   DTOs
   ============================ */

type CreateItemRequest struct {
	Name          string   `json:"name"`
	Description   *string  `json:"description,omitempty"`
	PriceEstimate *float64 `json:"price_estimate,omitempty"`
}

type ClubMarketplaceItem struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	Description   *string `json:"description,omitempty"`
	IsAvailable   bool    `json:"is_available"`
	OwnerID       string  `json:"owner_id"`
	OwnerUsername string  `json:"owner_username"`
}

/* ============================
   Item Logic
   ============================ */

func (s *MarketplaceService) CreateItem(
	ctx context.Context,
	userID string,
	req CreateItemRequest,
) (string, error) {

	if req.Name == "" {
		return "", errors.New("item name is required")
	}

	itemID := util.GenerateUUID()

	err := s.q.CreateItem(ctx, repository.CreateItemParams{
		ID:          itemID,
		Name:        req.Name,
		Description: req.Description,
		IsAvailable: true,
		OwnerID:     userID,
	})
	if err != nil {
		return "", err
	}

	return itemID, nil
}

func (s *MarketplaceService) UpdateItem(
	ctx context.Context,
	userID string,
	params repository.UpdateItemParams,
) error {

	item, err := s.q.GetItem(ctx, params.ID)
	if err != nil {
		return err
	}

	if item.OwnerID != userID {
		return errors.New("permission denied: not item owner")
	}

	return s.q.UpdateItem(ctx, params)
}

func (s *MarketplaceService) DeleteItem(
	ctx context.Context,
	userID string,
	itemID string,
) error {

	item, err := s.q.GetItem(ctx, itemID)
	if err != nil {
		return err
	}

	if item.OwnerID != userID {
		return errors.New("permission denied: not item owner")
	}

	return s.q.DeleteItem(ctx, itemID)
}

func (s *MarketplaceService) GetClubItems(
	ctx context.Context,
	userID string,
	clubID string,
) ([]ClubMarketplaceItem, error) {

	// Membership check: only club members can view
	isMember, err := s.q.IsUserMemberOfClub(ctx, repository.IsUserMemberOfClubParams{
		UserID: userID,
		ClubID: clubID,
	})
	if err != nil {
		return nil, err
	}
	if isMember == 0 {
		return nil, errors.New("permission denied: not a club member")
	}

	// Fetch items scoped strictly to this club
	items, err := s.q.GetItemsByClub(ctx, &clubID)
	if err != nil {
		return nil, err
	}

	out := make([]ClubMarketplaceItem, 0, len(items))
	usernameByID := map[string]string{}

	for _, it := range items {
		// Resolve username (best-effort, cached)
		if _, ok := usernameByID[it.OwnerID]; !ok {
			if disp, e := s.q.GetUserDisplay(ctx, it.OwnerID); e == nil {
				usernameByID[it.OwnerID] = disp.Username
			} else {
				usernameByID[it.OwnerID] = "unknown"
			}
		}

		out = append(out, ClubMarketplaceItem{
			ID:            it.ID,
			Name:          it.Name,
			Description:   it.Description,
			IsAvailable:   it.IsAvailable,
			OwnerID:       it.OwnerID,
			OwnerUsername: usernameByID[it.OwnerID],
		})
	}

	return out, nil
}

func (s *MarketplaceService) CreateClubItem(
	ctx context.Context,
	userID string,
	clubID string,
	req CreateItemRequest,
) (string, error) {

	if req.Name == "" {
		return "", errors.New("item name is required")
	}

	// Membership check
	isMember, err := s.q.IsUserMemberOfClub(ctx, repository.IsUserMemberOfClubParams{
		UserID: userID,
		ClubID: clubID,
	})
	if err != nil {
		return "", err
	}
	if isMember == 0 {
		return "", errors.New("permission denied: not a club member")
	}

	itemID := util.GenerateUUID()

	// Create item explicitly tied to this club
	err = s.q.CreateItemForClub(ctx, repository.CreateItemForClubParams{
		ID:          itemID,
		Name:        req.Name,
		Description: req.Description,
		IsAvailable: true,
		OwnerID:     userID,
		ClubID:      &clubID,
	})
	if err != nil {
		return "", err
	}

	return itemID, nil
}
