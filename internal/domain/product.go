package domain

import (
	"time"

	"github.com/google/uuid"
)

// Product represents a product item
type Product struct {
	ID            uuid.UUID `json:"id"`
	Name          string    `json:"name"`
	Barcode       *string   `json:"barcode,omitempty"`
	Category      *string   `json:"category,omitempty"`
	IsWeightBased bool      `json:"isWeightBased"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
	DeletedAt     *time.Time `json:"deletedAt,omitempty"`
}

// NewProduct creates a new Product with default values
func NewProduct(name string) *Product {
	now := time.Now()
	return &Product{
		ID:        uuid.New(),
		Name:      name,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// HasBarcode returns true if the product has a barcode
func (p *Product) HasBarcode() bool {
	return p.Barcode != nil && *p.Barcode != ""
}
