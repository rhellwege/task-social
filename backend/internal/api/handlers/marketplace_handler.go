package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rhellwege/task-social/internal/api/services"
	"github.com/rhellwege/task-social/internal/db/repository"
)

/* ============================
   Item Handlers
   ============================ */

// CreateItem godoc
//
//	@ID			CreateItem
//	@Summary	Create marketplace item
//	@Tags		Marketplace
//	@Accept		json
//	@Produce	json
//	@Security	ApiKeyAuth
//	@Param		item	body		services.CreateItemRequest	true	"Item data"
//	@Success	201		{object}	CreatedResponse
//	@Failure	400		{object}	ErrorResponse
//	@Failure	500		{object}	ErrorResponse
//	@Router		/api/marketplace/item [post]
func CreateItem(marketplace services.MarketplaceServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		userID := c.Locals("userID").(string)

		var req services.CreateItemRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{Error: err.Error()})
		}

		itemID, err := marketplace.CreateItem(ctx, userID, req)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{Error: err.Error()})
		}

		return c.Status(fiber.StatusCreated).JSON(CreatedResponse{
			Message: "Item created successfully",
			ID:      itemID,
		})
	}
}

// UpdateItem godoc
//
//	@ID			UpdateItem
//	@Summary	Update marketplace item
//	@Tags		Marketplace
//	@Accept		json
//	@Produce	json
//	@Security	ApiKeyAuth
//	@Param		item_id	path		string						true	"Item ID"
//	@Param		item	body		repository.UpdateItemParams	true	"Item update"
//	@Success	200		{object}	SuccessResponse
//	@Failure	400		{object}	ErrorResponse
//	@Failure	500		{object}	ErrorResponse
//	@Router		/api/marketplace/item/{item_id} [put]
func UpdateItem(marketplace services.MarketplaceServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		userID := c.Locals("userID").(string)
		itemID := c.Params("item_id")

		var params repository.UpdateItemParams
		if err := c.BodyParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{Error: err.Error()})
		}

		params.ID = itemID

		if err := marketplace.UpdateItem(ctx, userID, params); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{Error: err.Error()})
		}

		return c.JSON(SuccessResponse{
			Message: "Item updated successfully",
		})
	}
}

// DeleteItem godoc
//
//	@ID			DeleteItem
//	@Summary	Delete marketplace item
//	@Tags		Marketplace
//	@Produce	json
//	@Security	ApiKeyAuth
//	@Param		item_id	path		string	true	"Item ID"
//	@Success	200		{object}	SuccessResponse
//	@Failure	500		{object}	ErrorResponse
//	@Router		/api/marketplace/item/{item_id} [delete]
func DeleteItem(marketplace services.MarketplaceServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		userID := c.Locals("userID").(string)
		itemID := c.Params("item_id")

		if err := marketplace.DeleteItem(ctx, userID, itemID); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{Error: err.Error()})
		}

		return c.JSON(SuccessResponse{
			Message: "Item deleted successfully",
		})
	}
}
