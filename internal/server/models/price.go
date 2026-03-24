package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/pkg/models"
)

// Price represents a crowdsourced price entry for a product at a supermarket
type Price struct {
	models.BaseModel
	ProductID       uuid.UUID `gorm:"type:uuid;not null;index:idx_prices_product_supermarket"`
	SupermarketID   uuid.UUID `gorm:"type:uuid;not null;index:idx_prices_product_supermarket"`
	PriceBolivares  int64     `gorm:"type:bigint;not null"`
	PriceUSD        int64     `gorm:"type:bigint;not null"`
	ReportedBy      uuid.UUID `gorm:"type:uuid;not null;index:idx_prices_reported_by"`
	ConfidenceScore float64   `gorm:"type:decimal(3,2);default:0.00"`
	ReportsCount    int       `gorm:"default:1"`
	CapturedAt      time.Time
	TasaBCVDelDia   *int64 `gorm:"type:bigint"`
}

// TableName returns the table name for the model
func (Price) TableName() string {
	return "prices"
}

// NewPrice creates a new Price entry
func NewPrice(productID, supermarketID, reportedBy uuid.UUID, priceBolivares, priceUSD int64) *Price {
	now := time.Now()
	price := &Price{
		ProductID:       productID,
		SupermarketID:   supermarketID,
		PriceBolivares:  priceBolivares,
		PriceUSD:        priceUSD,
		ReportedBy:      reportedBy,
		ConfidenceScore: 0.5,
		ReportsCount:    1,
		CapturedAt:      now,
	}
	price.CreatedAt = now
	price.UpdatedAt = now
	return price
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

// BeforeCreate ensures default values before creation
func (p *Price) BeforeCreate(tx *gorm.DB) error {
	return p.BaseModel.BeforeCreate(tx)
}

// BeforeUpdate ensures updated_at is set before update
func (p *Price) BeforeUpdate(tx *gorm.DB) error {
	return p.BaseModel.BeforeUpdate(tx)
}
