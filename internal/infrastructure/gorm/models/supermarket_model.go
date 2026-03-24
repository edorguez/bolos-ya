package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	
	"github.com/edorguez/bolos-ya/internal/domain"
	"github.com/edorguez/bolos-ya/internal/pkg/models"
)

// SupermarketModel represents the database model for Supermarket
type SupermarketModel struct {
	models.SoftDeleteModel
	Name      string     `gorm:"type:varchar(255);not null"`
	Chain     *string    `gorm:"type:varchar(100)"`
	IsCustom  bool       `gorm:"default:false"`
	CreatedBy *uuid.UUID `gorm:"type:uuid"`
}

// TableName returns the table name for the model
func (SupermarketModel) TableName() string {
	return "supermarkets"
}

// ToDomain converts the database model to a domain entity
func (m *SupermarketModel) ToDomain() *domain.Supermarket {
	var deletedAt *time.Time
	if m.DeletedAt.Valid {
		deletedAt = &m.DeletedAt.Time
	}
	
	return &domain.Supermarket{
		ID:        m.ID,
		Name:      m.Name,
		Chain:     m.Chain,
		IsCustom:  m.IsCustom,
		CreatedBy: m.CreatedBy,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
		DeletedAt: deletedAt,
	}
}

// FromDomain populates the database model from a domain entity
func (m *SupermarketModel) FromDomain(supermarket *domain.Supermarket) {
	m.ID = supermarket.ID
	m.Name = supermarket.Name
	m.Chain = supermarket.Chain
	m.IsCustom = supermarket.IsCustom
	m.CreatedBy = supermarket.CreatedBy
	m.CreatedAt = supermarket.CreatedAt
	m.UpdatedAt = supermarket.UpdatedAt
	if supermarket.DeletedAt != nil {
		m.DeletedAt = gorm.DeletedAt{Time: *supermarket.DeletedAt, Valid: true}
	} else {
		m.DeletedAt = gorm.DeletedAt{}
	}
}

// BeforeCreate ensures default values before creation
func (m *SupermarketModel) BeforeCreate(tx *gorm.DB) error {
	return m.SoftDeleteModel.BeforeCreate(tx)
}

// BeforeUpdate ensures updated_at is set before update
func (m *SupermarketModel) BeforeUpdate(tx *gorm.DB) error {
	return m.SoftDeleteModel.BeforeUpdate(tx)
}
