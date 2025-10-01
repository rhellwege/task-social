package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/rhellwege/task-social/internal/api/services"
	"github.com/rhellwege/task-social/internal/db/repository"
)

// CreateMetric godoc
//
//	@ID				CreateMetric
//	@Summary		Create a new metric
//	@Description	Create a new metric with the provided details.
//	@Tags			Metric
//	@Accept			json
//	@Produce		json
//	@Security		ApiKeyAuth
//	@Param			metric	body		repository.CreateMetricParams	true	"Metric details"
//	@Success		201		{object}	CreatedResponse
//	@Failure		400		{object}	ErrorResponse
//	@Failure		401		{object}	ErrorResponse
//	@Failure		500		{object}	ErrorResponse
//	@Router			/api/metric [post]
func CreateMetric(metricService services.MetricServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()

		var params repository.CreateMetricParams
		if err := c.BodyParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		metricID, err := metricService.CreateMetric(ctx, params)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.Status(fiber.StatusCreated).JSON(CreatedResponse{
			Message: "Metric created successfully",
			ID:      metricID,
		})
	}
}

// GetMetric godoc
//
//	@ID				GetMetric
//	@Summary		Get a metric
//	@Description	Get a metric by ID.
//	@Tags			Metric
//	@Security		ApiKeyAuth
//	@Produce		json
//	@Param			metric_id	path		string	true	"Metric ID"
//	@Success		200			{object}	repository.Metric
//	@Failure		401			{object}	ErrorResponse
//	@Failure		500			{object}	ErrorResponse
//	@Router			/api/metric/{metric_id} [get]
func GetMetric(metricService services.MetricServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		metricID := c.Params("metric_id")

		metric, err := metricService.GetMetric(ctx, metricID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.JSON(metric)
	}
}

// UpdateMetric godoc
//
//	@ID				UpdateMetric
//	@Summary		Update a metric
//	@Description	Update a metric by ID.
//	@Tags			Metric
//	@Accept			json
//	@Produce		json
//	@Security		ApiKeyAuth
//	@Param			metric_id	path		string							true	"Metric ID"
//	@Param			metric		body		repository.UpdateMetricParams	true	"Metric details"
//	@Success		200			{object}	SuccessResponse
//	@Failure		400			{object}	ErrorResponse
//	@Failure		401			{object}	ErrorResponse
//	@Failure		500			{object}	ErrorResponse
//	@Router			/api/metric/{metric_id} [put]
func UpdateMetric(metricService services.MetricServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		metricID := c.Params("metric_id")

		var params repository.UpdateMetricParams
		if err := c.BodyParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}
		params.ID = metricID

		err := metricService.UpdateMetric(ctx, params)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.Status(fiber.StatusOK).JSON(SuccessResponse{
			Message: "Metric updated successfully",
		})
	}
}

// DeleteMetric godoc
//
//	@ID				DeleteMetric
//	@Summary		Delete a metric
//	@Description	Delete a metric by ID.
//	@Tags			Metric
//	@Security		ApiKeyAuth
//	@Produce		json
//	@Param			metric_id	path		string	true	"Metric ID"
//	@Success		200			{object}	SuccessResponse
//	@Failure		401			{object}	ErrorResponse
//	@Failure		500			{object}	ErrorResponse
//	@Router			/api/metric/{metric_id} [delete]
func DeleteMetric(metricService services.MetricServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		metricID := c.Params("metric_id")

		err := metricService.DeleteMetric(ctx, metricID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.Status(fiber.StatusOK).JSON(SuccessResponse{
			Message: "Metric deleted successfully",
		})
	}
}

// CreateMetricEntry godoc
//
//	@ID				CreateMetricEntry
//	@Summary		Create a new metric entry
//	@Description	Create a new metric entry for the current instance of a metric.
//	@Tags			Metric
//	@Accept			json
//	@Produce		json
//	@Security		ApiKeyAuth
//	@Param			metric_id	path		string								true	"Metric ID"
//	@Param			entry		body		repository.CreateMetricEntryParams	true	"Metric entry details"
//	@Success		201			{object}	CreatedResponse
//	@Failure		400			{object}	ErrorResponse
//	@Failure		401			{object}	ErrorResponse
//	@Failure		500			{object}	ErrorResponse
//	@Router			/api/metric/{metric_id}/entry [post]
func CreateMetricEntry(metricService services.MetricServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		userID := c.Locals("userID").(string)
		metricID := c.Params("metric_id")

		var params repository.CreateMetricEntryParams
		if err := c.BodyParser(&params); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		entryID, err := metricService.CreateMetricEntry(ctx, userID, metricID, params)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.Status(fiber.StatusCreated).JSON(CreatedResponse{
			Message: "Metric entry created successfully",
			ID:      entryID,
		})
	}
}

// GetLatestMetricEntries godoc
//
//	@ID				GetLatestMetricEntries
//	@Summary		Get latest metric entries
//	@Description	Get all entries for the latest metric instance.
//	@Tags			Metric
//	@Security		ApiKeyAuth
//	@Produce		json
//	@Param			metric_id	path		string	true	"Metric ID"
//	@Success		200			{array}		repository.MetricEntry
//	@Failure		401			{object}	ErrorResponse
//	@Failure		500			{object}	ErrorResponse
//	@Router			/api/metric/{metric_id}/latest-entries [get]
func GetLatestMetricEntries(metricService services.MetricServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		metricID := c.Params("metric_id")

		entries, err := metricService.GetLatestMetricEntries(ctx, metricID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.JSON(entries)
	}
}

// GetHistoricalMetricEntries godoc
//
//	@ID				GetHistoricalMetricEntries
//	@Summary		Get Historical metric entries
//	@Description	Get all entries for all metric instances given a metric.
//	@Tags			Metric
//	@Security		ApiKeyAuth
//	@Produce		json
//	@Param			metric_id	path		string	true	"Metric ID"
//	@Success		200			{array}		repository.MetricEntry
//	@Failure		401			{object}	ErrorResponse
//	@Failure		500			{object}	ErrorResponse
//	@Router			/api/metric/{metric_id}/historical-entries [get]
func GetHistoricalMetricEntries(metricService services.MetricServicer) fiber.Handler {
	return func(c *fiber.Ctx) error {
		ctx := c.Context()
		metricID := c.Params("metric_id")

		entries, err := metricService.GetHistoricalMetricEntries(ctx, metricID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
				Error: err.Error(),
			})
		}

		return c.JSON(entries)
	}
}
