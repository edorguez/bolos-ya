package domain

import (
	"time"

	"github.com/google/uuid"
)

// CartItem represents an item in a shopping cart
type CartItem struct {
	ID                uuid.UUID `json:"id"`
	CartID            uuid.UUID `json:"cartId"`
	ProductID         uuid.UUID `json:"productId"`
	PriceSnapshotBs   *int64    `json:"priceSnapshotBs,omitempty"`   // stored in cents
	PriceSnapshotUsd  *int64    `json:"priceSnapshotUsd,omitempty"`  // stored in cents
	Quantity          int       `json:"quantity"`
	IsManualEntry     bool      `json:"isManualEntry"`
	ProductImageUrl   *string   `json:"productImageUrl,omitempty"`
	AddedAt           time.Time `json:"addedAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}

// NewCartItem creates a new CartItem with default values
func NewCartItem(cartID, productID uuid.UUID, quantity int) *CartItem {
	now := time.Now()
	return &CartItem{
		ID:            uuid.New(),
		CartID:        cartID,
		ProductID:     productID,
		Quantity:      quantity,
		IsManualEntry: false,
		AddedAt:       now,
		UpdatedAt:     now,
	}
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
