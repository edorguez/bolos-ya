package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/pkg/models"
)

// CartItem represents an item in a shopping cart
type CartItem struct {
	models.BaseModel
	CartID           uuid.UUID `gorm:"type:uuid;not null;index:idx_cart_items_cart"`
	ProductID        uuid.UUID `gorm:"type:uuid;not null"`
	PriceSnapshotBs  *int64    `gorm:"type:bigint"`
	PriceSnapshotUsd *int64    `gorm:"type:bigint"`
	Quantity         int       `gorm:"default:1"`
	IsManualEntry    bool      `gorm:"default:false"`
	ProductImageUrl  *string   `gorm:"type:varchar(500)"`
	AddedAt          time.Time
}

// TableName returns the table name for the model
func (CartItem) TableName() string {
	return "cart_items"
}

// NewCartItem creates a new CartItem with default values
func NewCartItem(cartID, productID uuid.UUID, quantity int) *CartItem {
	now := time.Now()
	cartItem := &CartItem{
		CartID:        cartID,
		ProductID:     productID,
		Quantity:      quantity,
		IsManualEntry: false,
		AddedAt:       now,
	}
	cartItem.CreatedAt = now
	cartItem.UpdatedAt = now
	return cartItem
}

// HasPriceSnapshot returns true if price snapshots are available
func (ci *CartItem) HasPriceSnapshot() bool {
	return ci.PriceSnapshotBs != nil && ci.PriceSnapshotUsd != nil
}

// SubtotalBolivares calculates the subtotal in bolivares (price * quantity)
func (ci *CartItem) SubtotalBolivares() *int64 {
	if ci.PriceSnapshotBs == nil {
		return nil
	}
	subtotal := *ci.PriceSnapshotBs * int64(ci.Quantity)
	return &subtotal
}

// SubtotalUSD calculates the subtotal in USD (price * quantity)
func (ci *CartItem) SubtotalUSD() *int64 {
	if ci.PriceSnapshotUsd == nil {
		return nil
	}
	subtotal := *ci.PriceSnapshotUsd * int64(ci.Quantity)
	return &subtotal
}

// SetPriceSnapshot sets price snapshots for the cart item
func (ci *CartItem) SetPriceSnapshot(priceBolivares, priceUSD int64) {
	ci.PriceSnapshotBs = &priceBolivares
	ci.PriceSnapshotUsd = &priceUSD
	ci.UpdatedAt = time.Now()
}

// BeforeCreate ensures default values before creation
func (ci *CartItem) BeforeCreate(tx *gorm.DB) error {
	if err := ci.BaseModel.BeforeCreate(tx); err != nil {
		return err
	}
	// If AddedAt is zero, set it to CreatedAt
	if ci.AddedAt.IsZero() {
		ci.AddedAt = ci.CreatedAt
	}
	return nil
}

// BeforeUpdate ensures updated_at is set before update
func (ci *CartItem) BeforeUpdate(tx *gorm.DB) error {
	return ci.BaseModel.BeforeUpdate(tx)
}
