package domain

import (
	"time"

	"github.com/google/uuid"
)

// Supermarket represents a supermarket or store
type Supermarket struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Chain     *string   `json:"chain,omitempty"`
	IsCustom  bool      `json:"isCustom"`
	CreatedBy *uuid.UUID `json:"createdBy,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	DeletedAt *time.Time `json:"deletedAt,omitempty"`
}

// NewSupermarket creates a new Supermarket with default values
func NewSupermarket(name string, isCustom bool) *Supermarket {
	now := time.Now()
	return &Supermarket{
		ID:        uuid.New(),
		Name:      name,
		IsCustom:  isCustom,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// IsChainStore returns true if the supermarket belongs to a chain
func (s *Supermarket) IsChainStore() bool {
	return s.Chain != nil && *s.Chain != ""
}
