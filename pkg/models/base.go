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
	DeletedAt *time.Time
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

// BeforeDelete updates the DeletedAt timestamp
func (m *BaseModel) BeforeDelete(tx *gorm.DB) error {
	now := time.Now()
	m.DeletedAt = &now
	return nil
}

// IsZero checks if the model has zero ID (not persisted)
func (m *BaseModel) IsZero() bool {
	return m.ID == uuid.Nil
}

// IsDeleted checks if record is deleted
func (m *BaseModel) IsDeleted() bool {
	return m.DeletedAt != nil
}
