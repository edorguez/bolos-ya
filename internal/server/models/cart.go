package models

import (
	"github.com/google/uuid"

	"github.com/edorguez/bolos-ya/pkg/models"
)

// Cart represents a shopping cart
type Cart struct {
	models.BaseModel
	SupermarketID     uuid.UUID `gorm:"type:uuid;not null"`
	UserID            uuid.UUID `gorm:"type:uuid;not null"`
	IsActive          bool      `gorm:"not null;default:true"`
	BudgetBs          int64     `gorm:"type:bigint;not null;default:0"`
	BudgetUsd         int64     `gorm:"type:bigint;not null;default:0"`
	TotalEstimatedBs  int64     `gorm:"type:bigint;not null;default:0"`
	TotalEstimatedUsd int64     `gorm:"type:bigint;not null;default:0"`
}

// NewCart creates a new Cart with default values
func NewCart(
	userID,
	supermarketID uuid.UUID,
	isActive bool,
	budgetBs int64,
	budgetUsd int64,
	totalEstimatedBs int64,
	totalEstimatedUsd int64,
) *Cart {
	cart := &Cart{
		UserID:            userID,
		SupermarketID:     supermarketID,
		IsActive:          isActive,
		BudgetBs:          budgetBs,
		BudgetUsd:         budgetUsd,
		TotalEstimatedBs:  totalEstimatedBs,
		TotalEstimatedUsd: totalEstimatedUsd,
	}
	return cart
}
