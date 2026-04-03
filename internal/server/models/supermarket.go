package models

import (
	"github.com/edorguez/bolos-ya/pkg/models"
	"github.com/google/uuid"
)

// Supermarket represents a supermarket or store
type Supermarket struct {
	models.BaseModel
	Name     string    `gorm:"type:varchar(255);not null"`
	IsCustom bool      `gorm:"default:false"`
	ImageUrl *string   `gorm:"type:varchar(500)"`
	UserID   uuid.UUID `gorm:"type:uuid:not null"`
}

// NewSupermarket creates a new Supermarket with default values
func NewSupermarket(name string, isCustom bool, imageUrl *string, userId uuid.UUID) *Supermarket {
	supermarket := &Supermarket{
		Name:     name,
		IsCustom: isCustom,
		ImageUrl: imageUrl,
		UserID:   userId,
	}
	return supermarket
}
