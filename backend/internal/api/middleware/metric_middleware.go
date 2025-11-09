package middleware

import (
	"context"
	"time"

	"github.com/rhellwege/task-social/internal/db/repository"
	"github.com/rhellwege/task-social/internal/util"
)

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

			if CheckMetricInstanceForExpiration(metricInstance) {
				newDueAt, err := GetNewDueAt(metric.Interval)
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

func CheckMetricInstanceForExpiration(latestMetricInstance repository.MetricInstance) bool {
	dueAt := latestMetricInstance.DueAt
	currentTime := time.Now()

	if currentTime.Compare(dueAt) == -1 {
		return false
	}

	return true
}

func GetNewDueAt(interval string) (time.Time, error) {
	duration, err := time.ParseDuration(interval)
	if err != nil {
		var t time.Time
		return t, err
	}

	currentTime := time.Now()

	return currentTime.Add(duration), nil
}
