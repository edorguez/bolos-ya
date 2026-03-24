package domain

import (
	"time"

	"github.com/google/uuid"
)

// Price represents a crowdsourced price entry for a product at a supermarket
type Price struct {
	ID               uuid.UUID `json:"id"`
	ProductID        uuid.UUID `json:"productId"`
	SupermarketID    uuid.UUID `json:"supermarketId"`
	PriceBolivares   int64     `json:"priceBolivares"`   // stored in cents
	PriceUSD         int64     `json:"priceUsd"`         // stored in cents
	ReportedBy       uuid.UUID `json:"reportedBy"`
	ConfidenceScore  float64   `json:"confidenceScore"`  // 0.00 - 1.00
	ReportsCount     int       `json:"reportsCount"`
	CapturedAt       time.Time `json:"capturedAt"`
	TasaBCVDelDia    *int64    `json:"tasaBcvDelDia,omitempty"` // stored in cents
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

// NewPrice creates a new Price entry
func NewPrice(productID, supermarketID, reportedBy uuid.UUID, priceBolivares, priceUSD int64) *Price {
	now := time.Now()
	return &Price{
		ID:              uuid.New(),
		ProductID:       productID,
		SupermarketID:   supermarketID,
		PriceBolivares:  priceBolivares,
		PriceUSD:        priceUSD,
		ReportedBy:      reportedBy,
		ConfidenceScore: 0.5,
		ReportsCount:    1,
		CapturedAt:      now,
		CreatedAt:       now,
		UpdatedAt:       now,
	}
}

// PriceInBolivares returns the price in bolivares as float64
func (p *Price) PriceInBolivares() float64 {
	return float64(p.PriceBolivares) / 100.0
}

// PriceInUSD returns the price in USD as float64
func (p *Price) PriceInUSD() float64 {
	return float64(p.PriceUSD) / 100.0
}

// ExchangeRate returns the BCV exchange rate as float64 if available
func (p *Price) ExchangeRate() *float64 {
	if p.TasaBCVDelDia == nil {
		return nil
	}
	rate := float64(*p.TasaBCVDelDia) / 100.0
	return &rate
}
