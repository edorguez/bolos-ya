package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	
	"github.com/edorguez/bolos-ya/internal/domain"
	"github.com/edorguez/bolos-ya/internal/pkg/models"
)

// CartItemModel represents the database model for CartItem
type CartItemModel struct {
	models.BaseModel
	CartID            uuid.UUID `gorm:"type:uuid;not null;index:idx_cart_items_cart"`
	ProductID         uuid.UUID `gorm:"type:uuid;not null"`
	PriceSnapshotBs   *int64    `gorm:"type:bigint"`
	PriceSnapshotUsd  *int64    `gorm:"type:bigint"`
	Quantity          int       `gorm:"default:1"`
	IsManualEntry     bool      `gorm:"default:false"`
	ProductImageUrl   *string   `gorm:"type:varchar(500)"`
	AddedAt           time.Time
}

// TableName returns the table name for the model
func (CartItemModel) TableName() string {
	return "cart_items"
}

// ToDomain converts the database model to a domain entity
func (m *CartItemModel) ToDomain() *domain.CartItem {
	return &domain.CartItem{
		ID:               m.ID,
		CartID:           m.CartID,
		ProductID:        m.ProductID,
		PriceSnapshotBs:  m.PriceSnapshotBs,
		PriceSnapshotUsd: m.PriceSnapshotUsd,
		Quantity:         m.Quantity,
		IsManualEntry:    m.IsManualEntry,
		ProductImageUrl:  m.ProductImageUrl,
		AddedAt:          m.AddedAt,
		UpdatedAt:        m.UpdatedAt,
	}
}

// FromDomain populates the database model from a domain entity
func (m *CartItemModel) FromDomain(cartItem *domain.CartItem) {
	m.ID = cartItem.ID
	m.CartID = cartItem.CartID
	m.ProductID = cartItem.ProductID
	m.PriceSnapshotBs = cartItem.PriceSnapshotBs
	m.PriceSnapshotUsd = cartItem.PriceSnapshotUsd
	m.Quantity = cartItem.Quantity
	m.IsManualEntry = cartItem.IsManualEntry
	m.ProductImageUrl = cartItem.ProductImageUrl
	m.AddedAt = cartItem.AddedAt
	m.CreatedAt = cartItem.AddedAt // Use AddedAt as CreatedAt for DB
	m.UpdatedAt = cartItem.UpdatedAt
}

// BeforeCreate ensures default values before creation
func (m *CartItemModel) BeforeCreate(tx *gorm.DB) error {
	if err := m.BaseModel.BeforeCreate(tx); err != nil {
		return err
	}
	// If AddedAt is zero, set it to CreatedAt
	if m.AddedAt.IsZero() {
		m.AddedAt = m.CreatedAt
	}
	return nil
}

// BeforeUpdate ensures updated_at is set before update
func (m *CartItemModel) BeforeUpdate(tx *gorm.DB) error {
	return m.BaseModel.BeforeUpdate(tx)
}
