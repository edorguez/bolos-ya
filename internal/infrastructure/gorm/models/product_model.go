package models

import (
	"time"

	"gorm.io/gorm"
	
	"github.com/edorguez/bolos-ya/internal/domain"
	"github.com/edorguez/bolos-ya/internal/pkg/models"
)

// ProductModel represents the database model for Product
type ProductModel struct {
	models.SoftDeleteModel
	Name          string  `gorm:"type:varchar(255);not null"`
	Barcode       *string `gorm:"type:varchar(50)"`
	Category      *string `gorm:"type:varchar(100)"`
	IsWeightBased bool    `gorm:"default:false"`
}

// TableName returns the table name for the model
func (ProductModel) TableName() string {
	return "products"
}

// ToDomain converts the database model to a domain entity
func (m *ProductModel) ToDomain() *domain.Product {
	var deletedAt *time.Time
	if m.DeletedAt.Valid {
		deletedAt = &m.DeletedAt.Time
	}
	
	return &domain.Product{
		ID:            m.ID,
		Name:          m.Name,
		Barcode:       m.Barcode,
		Category:      m.Category,
		IsWeightBased: m.IsWeightBased,
		CreatedAt:     m.CreatedAt,
		UpdatedAt:     m.UpdatedAt,
		DeletedAt:     deletedAt,
	}
}

// FromDomain populates the database model from a domain entity
func (m *ProductModel) FromDomain(product *domain.Product) {
	m.ID = product.ID
	m.Name = product.Name
	m.Barcode = product.Barcode
	m.Category = product.Category
	m.IsWeightBased = product.IsWeightBased
	m.CreatedAt = product.CreatedAt
	m.UpdatedAt = product.UpdatedAt
	if product.DeletedAt != nil {
		m.DeletedAt = gorm.DeletedAt{Time: *product.DeletedAt, Valid: true}
	} else {
		m.DeletedAt = gorm.DeletedAt{}
	}
}

// BeforeCreate ensures default values before creation
func (m *ProductModel) BeforeCreate(tx *gorm.DB) error {
	return m.SoftDeleteModel.BeforeCreate(tx)
}

// BeforeUpdate ensures updated_at is set before update
func (m *ProductModel) BeforeUpdate(tx *gorm.DB) error {
	return m.SoftDeleteModel.BeforeUpdate(tx)
}
