package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// BaseModel contains common fields for all database models
type BaseModel struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

// BeforeCreate sets UUID and timestamps before creating a new record
func (m *BaseModel) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	m.CreatedAt = time.Now()
	m.UpdatedAt = time.Now()
	return nil
}

// BeforeUpdate updates the UpdatedAt timestamp
func (m *BaseModel) BeforeUpdate(tx *gorm.DB) error {
	m.UpdatedAt = time.Now()
	return nil
}

// SoftDeleteModel extends BaseModel with soft delete capability
type SoftDeleteModel struct {
	BaseModel
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

// IsZero checks if the model has zero ID (not persisted)
func (m *BaseModel) IsZero() bool {
	return m.ID == uuid.Nil
}
