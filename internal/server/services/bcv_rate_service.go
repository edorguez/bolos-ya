package services

import (
	"context"
	"crypto/tls"
	"fmt"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gocolly/colly/v2"
	"go.uber.org/zap"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/repository"
)

type BCVRateService interface {
	GetLatestRate(ctx context.Context) (*models.BCVRate, error)
	ScrapeAndStore(ctx context.Context) (*models.BCVRate, error)
}

const bcvURL = "https://www.bcv.org.ve"

type bcvRateService struct {
	repo repository.BCVRateRepository
	log  *zap.Logger
}

func NewBCVRateService(repo repository.BCVRateRepository, log *zap.Logger) BCVRateService {
	return &bcvRateService{repo: repo, log: log}
}

func (s *bcvRateService) scrapeURL() string { return bcvURL }

func (s *bcvRateService) GetLatestRate(ctx context.Context) (*models.BCVRate, error) {
	return s.repo.GetLatest(ctx)
}

func (s *bcvRateService) ScrapeAndStore(ctx context.Context) (*models.BCVRate, error) {
	rate, err := s.scrape(ctx)
	if err != nil {
		return nil, fmt.Errorf("scrape failed: %w", err)
	}

	if err := s.repo.Upsert(ctx, rate); err != nil {
		return nil, fmt.Errorf("upsert failed: %w", err)
	}

	s.log.Info("BCV rates scraped and stored",
		zap.String("rate_date", rate.RateDate),
		zap.Int64("usd_rate", rate.UsdRate),
		zap.Int64("eur_rate", rate.EurRate),
	)

	return rate, nil
}

func (s *bcvRateService) scrape(ctx context.Context) (*models.BCVRate, error) {
	c := colly.NewCollector(
		colly.AllowedDomains("www.bcv.org.ve", "bcv.org.ve"),
		colly.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"),
	)

	c.WithTransport(&http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	})

	rate := &models.BCVRate{}
	var scrapeErr error

	c.OnHTML("#dolar .strong-tb", func(e *colly.HTMLElement) {
		if scrapeErr != nil {
			return
		}
		val, err := parseRate(e.Text)
		if err != nil {
			scrapeErr = fmt.Errorf("parse USD rate: %w", err)
			return
		}
		rate.UsdRate = val
	})

	c.OnHTML("#euro .strong-tb", func(e *colly.HTMLElement) {
		if scrapeErr != nil {
			return
		}
		val, err := parseRate(e.Text)
		if err != nil {
			scrapeErr = fmt.Errorf("parse EUR rate: %w", err)
			return
		}
		rate.EurRate = val
	})

	c.OnHTML(".date-display-single", func(e *colly.HTMLElement) {
		if scrapeErr != nil {
			return
		}
		content := e.Attr("content")
		if content == "" {
			return
		}
		t, err := time.Parse("2006-01-02T15:04:05-07:00", content)
		if err != nil {
			scrapeErr = fmt.Errorf("parse date: %w", err)
			return
		}
		rate.RateDate = t.Format("2006-01-02")
	})

	c.OnError(func(_ *colly.Response, err error) {
		scrapeErr = fmt.Errorf("colly request: %w", err)
	})

	if err := c.Visit(s.scrapeURL()); err != nil {
		return nil, fmt.Errorf("visit %s: %w", s.scrapeURL(), err)
	}

	c.Wait()

	if scrapeErr != nil {
		return nil, scrapeErr
	}

	if rate.UsdRate == 0 || rate.EurRate == 0 || rate.RateDate == "" {
		return nil, fmt.Errorf("incomplete scrape: usd=%d eur=%d date=%s", rate.UsdRate, rate.EurRate, rate.RateDate)
	}

	return rate, nil
}

func parseRate(text string) (int64, error) {
	text = strings.TrimSpace(text)
	text = strings.ReplaceAll(text, ",", ".")
	val, err := strconv.ParseFloat(text, 64)
	if err != nil {
		return 0, fmt.Errorf("parse float %q: %w", text, err)
	}
	return int64(math.Round(val * 100)), nil
}
