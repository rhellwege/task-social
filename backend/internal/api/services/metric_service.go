package services

import (
	"context"
	"time"

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

func CheckMetricsForExpiration(ctx context.Context, q repository.Querier) error {
	// Get all public clubs
	clubs, err := q.GetPublicClubs(ctx)
	if err != nil {
		return err
	}

	// For each club, get metrics
	for _, club := range clubs {
		metrics, err := q.GetClubMetrics(ctx, club.ID)
		if err != nil {
			return err
		}

		// For each metric, call CheckMetricInstanceForExpiration
		for _, metric := range metrics {
			metricInstance, err := q.GetLatestMetricInstance(ctx, metric.ID)
			if err != nil {
				return err
			}

			if checkMetricInstanceForExpiration(metricInstance) {
				newDueAt, err := getNewDueAt(metric.Interval)
				if err != nil {
					return err
				}

				params := repository.CreateMetricInstanceParams{
					ID:       util.GenerateUUID(),
					MetricID: metric.ID,
					DueAt:    newDueAt,
				}

				err = q.CreateMetricInstance(ctx, params)
				if err != nil {
					return err
				}
			}
		}
	}

	return nil
}

func checkMetricInstanceForExpiration(latestMetricInstance repository.MetricInstance) bool {
	dueAt := latestMetricInstance.DueAt
	currentTime := time.Now()

	if currentTime.Compare(dueAt) == -1 {
		return false
	}

	return true
}

func getNewDueAt(interval string) (time.Time, error) {
	duration, err := time.ParseDuration(interval)
	if err != nil {
		var t time.Time
		return t, err
	}

	currentTime := time.Now()

	return currentTime.Add(duration), nil
}
