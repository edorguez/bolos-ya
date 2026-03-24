package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	
	"github.com/edorguez/bolos-ya/internal/domain"
	"github.com/edorguez/bolos-ya/internal/pkg/models"
)

// CartModel represents the database model for Cart
type CartModel struct {
	models.BaseModel
	UserID              uuid.UUID             `gorm:"type:uuid;not null;index:idx_carts_user_active"`
	SupermarketID       uuid.UUID             `gorm:"type:uuid;not null;index:idx_carts_supermarket"`
	Status              domain.CartStatus     `gorm:"type:varchar(50);default:'active';index:idx_carts_user_active"`
	BudgetBs            int64                 `gorm:"type:bigint;default:0"`
	BudgetUsd           int64                 `gorm:"type:bigint;default:0"`
	TotalEstimatedBs    int64                 `gorm:"type:bigint;default:0"`
	TotalEstimatedUsd   int64                 `gorm:"type:bigint;default:0"`
}

// TableName returns the table name for the model
func (CartModel) TableName() string {
	return "carts"
}

// ToDomain converts the database model to a domain entity
func (m *CartModel) ToDomain() *domain.Cart {
	return &domain.Cart{
		ID:                m.ID,
		UserID:            m.UserID,
		SupermarketID:     m.SupermarketID,
		Status:            m.Status,
		BudgetBs:          m.BudgetBs,
		BudgetUsd:         m.BudgetUsd,
		TotalEstimatedBs:  m.TotalEstimatedBs,
		TotalEstimatedUsd: m.TotalEstimatedUsd,
		CreatedAt:         m.CreatedAt,
		UpdatedAt:         m.UpdatedAt,
	}
}

// FromDomain populates the database model from a domain entity
func (m *CartModel) FromDomain(cart *domain.Cart) {
	m.ID = cart.ID
	m.UserID = cart.UserID
	m.SupermarketID = cart.SupermarketID
	m.Status = cart.Status
	m.BudgetBs = cart.BudgetBs
	m.BudgetUsd = cart.BudgetUsd
	m.TotalEstimatedBs = cart.TotalEstimatedBs
	m.TotalEstimatedUsd = cart.TotalEstimatedUsd
	m.CreatedAt = cart.CreatedAt
	m.UpdatedAt = cart.UpdatedAt
}

// BeforeCreate ensures default values before creation
func (m *CartModel) BeforeCreate(tx *gorm.DB) error {
	return m.BaseModel.BeforeCreate(tx)
}

// BeforeUpdate ensures updated_at is set before update
func (m *CartModel) BeforeUpdate(tx *gorm.DB) error {
	return m.BaseModel.BeforeUpdate(tx)
}
