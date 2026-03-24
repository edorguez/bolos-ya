package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/pkg/models"
)

// CartStatus represents the status of a shopping cart
type CartStatus string

const (
	CartStatusActive    CartStatus = "active"
	CartStatusCompleted CartStatus = "completed"
	CartStatusAbandoned CartStatus = "abandoned"
	CartStatusArchived  CartStatus = "archived"
)

// Cart represents a shopping cart
type Cart struct {
	models.BaseModel
	UserID            uuid.UUID  `gorm:"type:uuid;not null;index:idx_carts_user_active"`
	SupermarketID     uuid.UUID  `gorm:"type:uuid;not null;index:idx_carts_supermarket"`
	Status            CartStatus `gorm:"type:varchar(50);default:'active';index:idx_carts_user_active"`
	BudgetBs          int64      `gorm:"type:bigint;default:0"`
	BudgetUsd         int64      `gorm:"type:bigint;default:0"`
	TotalEstimatedBs  int64      `gorm:"type:bigint;default:0"`
	TotalEstimatedUsd int64      `gorm:"type:bigint;default:0"`
}

// TableName returns the table name for the model
func (Cart) TableName() string {
	return "carts"
}

// NewCart creates a new Cart with default values
func NewCart(userID, supermarketID uuid.UUID) *Cart {
	now := time.Now()
	cart := &Cart{
		UserID:            userID,
		SupermarketID:     supermarketID,
		Status:            CartStatusActive,
		BudgetBs:          0,
		BudgetUsd:         0,
		TotalEstimatedBs:  0,
		TotalEstimatedUsd: 0,
	}
	cart.CreatedAt = now
	cart.UpdatedAt = now
	return cart
}

// IsActive returns true if the cart is active
func (c *Cart) IsActive() bool {
	return c.Status == CartStatusActive
}

// BudgetInBolivares returns the budget in bolivares as float64
func (c *Cart) BudgetInBolivares() float64 {
	return float64(c.BudgetBs) / 100.0
}

// BudgetInUSD returns the budget in USD as float64
func (c *Cart) BudgetInUSD() float64 {
	return float64(c.BudgetUsd) / 100.0
}

// TotalEstimatedInBolivares returns the total estimated cost in bolivares as float64
func (c *Cart) TotalEstimatedInBolivares() float64 {
	return float64(c.TotalEstimatedBs) / 100.0
}

// TotalEstimatedInUSD returns the total estimated cost in USD as float64
func (c *Cart) TotalEstimatedInUSD() float64 {
	return float64(c.TotalEstimatedUsd) / 100.0
}

// IsOverBudget returns true if the total estimated cost exceeds the budget
func (c *Cart) IsOverBudget() bool {
	return c.TotalEstimatedBs > c.BudgetBs || c.TotalEstimatedUsd > c.BudgetUsd
}

// BeforeCreate ensures default values before creation
func (c *Cart) BeforeCreate(tx *gorm.DB) error {
	return c.BaseModel.BeforeCreate(tx)
}

// BeforeUpdate ensures updated_at is set before update
func (c *Cart) BeforeUpdate(tx *gorm.DB) error {
	return c.BaseModel.BeforeUpdate(tx)
}
