package models

import (
	"github.com/google/uuid"

	"github.com/edorguez/bolos-ya/pkg/models"
)

// CartProduct represents a product in a shopping cart
type CartProduct struct {
	models.BaseModel
	CartID        uuid.UUID `gorm:"type:uuid;not null"`
	ProductID     uuid.UUID `gorm:"type:uuid;not null"`
	Quantity      int       `gorm:"not null;default:1"`
	IsManualEntry bool      `gorm:"not null;default:false"`
}

// NewCartProduct creates a new CartProduct with default values
func NewCartProduct(cartID, productID uuid.UUID, quantity int, isManualEntry bool) *CartProduct {
	cartProduct := &CartProduct{
		CartID:        cartID,
		ProductID:     productID,
		Quantity:      quantity,
		IsManualEntry: isManualEntry,
	}
	return cartProduct
}
