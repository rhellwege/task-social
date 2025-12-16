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
