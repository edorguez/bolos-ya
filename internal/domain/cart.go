package domain

import (
	"time"

	"github.com/google/uuid"
)

// CartStatus represents the status of a shopping cart
type CartStatus string

const (
	CartStatusActive   CartStatus = "active"
	CartStatusCompleted CartStatus = "completed"
	CartStatusAbandoned CartStatus = "abandoned"
	CartStatusArchived  CartStatus = "archived"
)

// Cart represents a shopping cart
type Cart struct {
	ID                  uuid.UUID  `json:"id"`
	UserID              uuid.UUID  `json:"userId"`
	SupermarketID       uuid.UUID  `json:"supermarketId"`
	Status              CartStatus `json:"status"`
	BudgetBs            int64      `json:"budgetBs"`            // stored in cents
	BudgetUsd           int64      `json:"budgetUsd"`           // stored in cents
	TotalEstimatedBs    int64      `json:"totalEstimatedBs"`    // stored in cents
	TotalEstimatedUsd   int64      `json:"totalEstimatedUsd"`   // stored in cents
	CreatedAt           time.Time  `json:"createdAt"`
	UpdatedAt           time.Time  `json:"updatedAt"`
}

// NewCart creates a new Cart with default values
func NewCart(userID, supermarketID uuid.UUID) *Cart {
	now := time.Now()
	return &Cart{
		ID:                uuid.New(),
		UserID:            userID,
		SupermarketID:     supermarketID,
		Status:            CartStatusActive,
		BudgetBs:          0,
		BudgetUsd:         0,
		TotalEstimatedBs:  0,
		TotalEstimatedUsd: 0,
		CreatedAt:         now,
		UpdatedAt:         now,
	}
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
