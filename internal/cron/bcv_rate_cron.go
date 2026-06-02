package cron

import (
	"context"
	"time"

	"go.uber.org/zap"

	"github.com/edorguez/bolos-ya/internal/server/services"
)

func StartBCVRateCron(svc services.BCVRateService, log *zap.Logger) {
	ctx := context.Background()

	if _, err := svc.ScrapeAndStore(ctx); err != nil {
		log.Warn("initial BCV scrape failed", zap.Error(err))
	} else {
		log.Info("initial BCV scrape succeeded")
	}

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
			if _, err := svc.ScrapeAndStore(ctx); err != nil {
				log.Error("scheduled BCV scrape failed", zap.Error(err))
			}
		}
	}
}
