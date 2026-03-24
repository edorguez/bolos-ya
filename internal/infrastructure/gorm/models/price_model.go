package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	
	"github.com/edorguez/bolos-ya/internal/domain"
	"github.com/edorguez/bolos-ya/internal/pkg/models"
)

// PriceModel represents the database model for Price
type PriceModel struct {
	models.BaseModel
	ProductID        uuid.UUID `gorm:"type:uuid;not null;index:idx_prices_product_supermarket"`
	SupermarketID    uuid.UUID `gorm:"type:uuid;not null;index:idx_prices_product_supermarket"`
	PriceBolivares   int64     `gorm:"type:bigint;not null"`
	PriceUSD         int64     `gorm:"type:bigint;not null"`
	ReportedBy       uuid.UUID `gorm:"type:uuid;not null;index:idx_prices_reported_by"`
	ConfidenceScore  float64   `gorm:"type:decimal(3,2);default:0.00"`
	ReportsCount     int       `gorm:"default:1"`
	CapturedAt       time.Time
	TasaBCVDelDia    *int64 `gorm:"type:bigint"`
}

// TableName returns the table name for the model
func (PriceModel) TableName() string {
	return "prices"
}

// ToDomain converts the database model to a domain entity
func (m *PriceModel) ToDomain() *domain.Price {
	return &domain.Price{
		ID:              m.ID,
		ProductID:       m.ProductID,
		SupermarketID:   m.SupermarketID,
		PriceBolivares:  m.PriceBolivares,
		PriceUSD:        m.PriceUSD,
		ReportedBy:      m.ReportedBy,
		ConfidenceScore: m.ConfidenceScore,
		ReportsCount:    m.ReportsCount,
		CapturedAt:      m.CapturedAt,
		TasaBCVDelDia:   m.TasaBCVDelDia,
		CreatedAt:       m.CreatedAt,
		UpdatedAt:       m.UpdatedAt,
	}
}

// FromDomain populates the database model from a domain entity
func (m *PriceModel) FromDomain(price *domain.Price) {
	m.ID = price.ID
	m.ProductID = price.ProductID
	m.SupermarketID = price.SupermarketID
	m.PriceBolivares = price.PriceBolivares
	m.PriceUSD = price.PriceUSD
	m.ReportedBy = price.ReportedBy
	m.ConfidenceScore = price.ConfidenceScore
	m.ReportsCount = price.ReportsCount
	m.CapturedAt = price.CapturedAt
	m.TasaBCVDelDia = price.TasaBCVDelDia
	m.CreatedAt = price.CreatedAt
	m.UpdatedAt = price.UpdatedAt
}

// BeforeCreate ensures default values before creation
func (m *PriceModel) BeforeCreate(tx *gorm.DB) error {
	return m.BaseModel.BeforeCreate(tx)
}

// BeforeUpdate ensures updated_at is set before update
func (m *PriceModel) BeforeUpdate(tx *gorm.DB) error {
	return m.BaseModel.BeforeUpdate(tx)
}
