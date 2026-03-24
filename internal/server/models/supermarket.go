package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/pkg/models"
)

// Supermarket represents a supermarket or store
type Supermarket struct {
	models.SoftDeleteModel
	Name      string     `gorm:"type:varchar(255);not null"`
	Chain     *string    `gorm:"type:varchar(100)"`
	IsCustom  bool       `gorm:"default:false"`
	CreatedBy *uuid.UUID `gorm:"type:uuid"`
}

// TableName returns the table name for the model
func (Supermarket) TableName() string {
	return "supermarkets"
}

// NewSupermarket creates a new Supermarket with default values
func NewSupermarket(name string, isCustom bool) *Supermarket {
	now := time.Now()
	supermarket := &Supermarket{
		Name:     name,
		IsCustom: isCustom,
	}
	supermarket.CreatedAt = now
	supermarket.UpdatedAt = now
	return supermarket
}

// IsChainStore returns true if the supermarket belongs to a chain
func (s *Supermarket) IsChainStore() bool {
	return s.Chain != nil && *s.Chain != ""
}

// BeforeCreate ensures default values before creation
func (s *Supermarket) BeforeCreate(tx *gorm.DB) error {
	return s.SoftDeleteModel.BeforeCreate(tx)
}

// BeforeUpdate ensures updated_at is set before update
func (s *Supermarket) BeforeUpdate(tx *gorm.DB) error {
	return s.SoftDeleteModel.BeforeUpdate(tx)
}
