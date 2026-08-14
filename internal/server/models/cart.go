package models

import (
	"github.com/google/uuid"

	"github.com/edorguez/merki/pkg/models"
)

// Cart represents a shopping cart
type Cart struct {
	models.BaseModel
	SupermarketID     uuid.UUID    `gorm:"type:uuid;not null"`
	UserID            uuid.UUID    `gorm:"type:uuid;not null"`
	LocalID           string       `gorm:"column:local_id;type:text;index"`
	IsActive          bool         `gorm:"not null;default:true"`
	BudgetBs          int64        `gorm:"type:bigint;not null;default:0"`
	BudgetUsd         int64        `gorm:"type:bigint;not null;default:0"`
	TotalEstimatedBs  *int64       `gorm:"type:bigint"`
	TotalEstimatedUsd *int64       `gorm:"type:bigint"`
	Supermarket       *Supermarket `gorm:"foreignKey:SupermarketID"`
}

// NewCart creates a new Cart with default values
func NewCart(
	userID,
	supermarketID uuid.UUID,
	isActive bool,
	budgetBs int64,
	budgetUsd int64,
) *Cart {
	cart := &Cart{
		UserID:            userID,
		SupermarketID:     supermarketID,
		IsActive:          isActive,
		BudgetBs:          budgetBs,
		BudgetUsd:         budgetUsd,
		TotalEstimatedBs:  nil,
		TotalEstimatedUsd: nil,
	}
	return cart
}
