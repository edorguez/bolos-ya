package models

import (
	"github.com/edorguez/bolos-ya/pkg/models"
	"github.com/google/uuid"
)

// Product represents a product item
type Product struct {
	models.BaseModel
	SupermarketID  uuid.UUID `gorm:"type:uuid;not null"`
	UserID         uuid.UUID `gorm:"type:uuid;not null"`
	Name           string    `gorm:"type:varchar(100);not null"`
	Barcode        *string   `gorm:"type:varchar(50)"`
	IsWeightBased  bool      `gorm:"default:false"`
	PriceUsd       int64     `gorm:"type:bigint"`
	PriceBolivares int64     `gorm:"type:bigint"`
	PriceBcv       int64     `gorm:"type:bigint"`
	ImageUrl       *string   `gorm:"type:varchar(500)"`
}

// NewProduct creates a new Product with default values
func NewProduct(
	supermarketId uuid.UUID,
	userId uuid.UUID,
	name string,
	barcode *string,
	isWeightBased bool,
	priceUsd int64,
	priceBolivares int64,
	priceBcv int64,
	imageUrl *string,
) *Product {
	product := &Product{
		SupermarketID:  supermarketId,
		UserID:         userId,
		Name:           name,
		Barcode:        barcode,
		IsWeightBased:  isWeightBased,
		PriceUsd:       priceUsd,
		PriceBolivares: priceBolivares,
		PriceBcv:       priceBcv,
		ImageUrl:       imageUrl,
	}
	return product
}
