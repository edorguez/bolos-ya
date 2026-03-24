package models

import (
	"time"

	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/pkg/models"
)

// Product represents a product item
type Product struct {
	models.SoftDeleteModel
	Name          string  `gorm:"type:varchar(255);not null"`
	Barcode       *string `gorm:"type:varchar(50)"`
	Category      *string `gorm:"type:varchar(100)"`
	IsWeightBased bool    `gorm:"default:false"`
}

// TableName returns the table name for the model
func (Product) TableName() string {
	return "products"
}

// NewProduct creates a new Product with default values
func NewProduct(name string) *Product {
	now := time.Now()
	product := &Product{
		Name: name,
	}
	product.CreatedAt = now
	product.UpdatedAt = now
	return product
}

// HasBarcode returns true if the product has a barcode
func (p *Product) HasBarcode() bool {
	return p.Barcode != nil && *p.Barcode != ""
}

// BeforeCreate ensures default values before creation
func (p *Product) BeforeCreate(tx *gorm.DB) error {
	return p.SoftDeleteModel.BeforeCreate(tx)
}

// BeforeUpdate ensures updated_at is set before update
func (p *Product) BeforeUpdate(tx *gorm.DB) error {
	return p.SoftDeleteModel.BeforeUpdate(tx)
}
