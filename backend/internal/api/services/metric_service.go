package services

import (
	"context"

	"github.com/rhellwege/task-social/internal/db/repository"
	"github.com/rhellwege/task-social/internal/util"
)

type MetricServicer interface {
	CreateMetric(ctx context.Context, params repository.CreateMetricParams) (string, error)
	GetMetric(ctx context.Context, metricID string) (repository.Metric, error)
	UpdateMetric(ctx context.Context, params repository.UpdateMetricParams) error
	DeleteMetric(ctx context.Context, metricID string) error
	CreateMetricEntry(ctx context.Context, userID string, metricID string, params repository.CreateMetricEntryParams) (string, error)
	GetLatestMetricEntries(ctx context.Context, metricID string) ([]repository.MetricEntry, error)
	GetHistoricalMetricEntries(ctx context.Context, metricID string) ([]repository.MetricEntry, error)
}

type MetricService struct {
	q repository.Querier
	c ClubServicer
}

var _ MetricServicer = (*MetricService)(nil)

func NewMetricService(q repository.Querier, c ClubServicer) *MetricService {
	return &MetricService{q: q, c: c}
}

func (s *MetricService) CreateMetric(ctx context.Context, params repository.CreateMetricParams) (string, error) {
	metricID := util.GenerateUUID()
	params.ID = metricID

	err := s.q.CreateMetric(ctx, params)
	if err != nil {
		return "", err
	}

	return metricID, nil
}

func (s *MetricService) GetMetric(ctx context.Context, metricID string) (repository.Metric, error) {
	return s.q.GetMetric(ctx, metricID)
}

func (s *MetricService) UpdateMetric(ctx context.Context, params repository.UpdateMetricParams) error {
	return s.q.UpdateMetric(ctx, params)
}

func (s *MetricService) DeleteMetric(ctx context.Context, metricID string) error {
	return s.q.DeleteMetric(ctx, metricID)
}

func (s *MetricService) CreateMetricEntry(ctx context.Context, userID string, metricID string, params repository.CreateMetricEntryParams) (string, error) {
	instance, err := s.q.GetLatestMetricInstance(ctx, metricID)
	if err != nil {
		return "", err
	}

	params.UserID = userID
	params.MetricInstanceID = instance.ID

	err = s.q.CreateMetricEntry(ctx, params)
	if err != nil {
		return "", err
	}

	return instance.ID, nil
}

func (s *MetricService) GetLatestMetricEntries(ctx context.Context, metricID string) ([]repository.MetricEntry, error) {
	instance, err := s.q.GetLatestMetricInstance(ctx, metricID)
	if err != nil {
		return nil, err
	}

	return s.q.GetMetricEntries(ctx, instance.ID)
}

func (s *MetricService) GetHistoricalMetricEntries(ctx context.Context, metricID string) ([]repository.MetricEntry, error) {
	return s.q.GetHistoricalMetricEntries(ctx, metricID)
}

func (s *MetricService) GetLatestMetricInstance(ctx context.Context, metricID string) (repository.MetricInstance, error) {
	return s.q.GetLatestMetricInstance(ctx, metricID)
}
