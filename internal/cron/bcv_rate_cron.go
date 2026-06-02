package cron

import (
	"context"
	"time"

	"go.uber.org/zap"

	"github.com/edorguez/bolos-ya/internal/server/services"
)

const (
	retryInterval = 10 * time.Minute
	maxRetries    = 36
)

func StartBCVRateCron(svc services.BCVRateService, log *zap.Logger) {
	ctx := context.Background()

	scrapeWithRetry(ctx, svc, log)

	for {
		now := time.Now()
		next := time.Date(now.Year(), now.Month(), now.Day(), 4, 0, 0, 0, now.Location())
		if !now.Before(next) {
			next = next.Add(24 * time.Hour)
		}
		duration := next.Sub(now)
		log.Info("next BCV scrape scheduled", zap.Time("at", next), zap.Duration("in", duration))

		select {
		case <-time.After(duration):
			scrapeWithRetry(ctx, svc, log)
		case <-ctx.Done():
			return
		}
	}
}

func scrapeWithRetry(ctx context.Context, svc services.BCVRateService, log *zap.Logger) {
	for i := 0; i < maxRetries; i++ {
		_, err := svc.ScrapeAndStore(ctx)
		if err == nil {
			log.Info("BCV scrape succeeded")
			return
		}

		if i < maxRetries-1 {
			log.Warn("BCV scrape failed, retrying",
				zap.Int("attempt", i+1),
				zap.Int("max_retries", maxRetries),
				zap.Duration("retry_in", retryInterval),
				zap.Error(err),
			)

			select {
			case <-time.After(retryInterval):
			case <-ctx.Done():
				return
			}
		} else {
			log.Error("BCV scrape failed after all retries, giving up until next cycle",
				zap.Int("attempts", maxRetries),
				zap.Duration("retry_duration", maxRetries*retryInterval),
				zap.Error(err),
			)
		}
	}
}
