package models

import (
	"time"

	"gorm.io/gorm"
	
	"github.com/edorguez/bolos-ya/internal/domain"
)

// ConfigModel represents the database model for Config
type ConfigModel struct {
	Key       string    `gorm:"type:varchar(100);primaryKey"`
	Value     string    `gorm:"type:text"`
	UpdatedAt time.Time
}

// TableName returns the table name for the model
func (ConfigModel) TableName() string {
	return "config"
}

// ToDomain converts the database model to a domain entity
func (m *ConfigModel) ToDomain() *domain.Config {
	return &domain.Config{
		Key:       m.Key,
		Value:     m.Value,
		UpdatedAt: m.UpdatedAt,
	}
}

// FromDomain populates the database model from a domain entity
func (m *ConfigModel) FromDomain(config *domain.Config) {
	m.Key = config.Key
	m.Value = config.Value
	m.UpdatedAt = config.UpdatedAt
}

// BeforeCreate sets UpdatedAt before creation
func (m *ConfigModel) BeforeCreate(tx *gorm.DB) error {
	m.UpdatedAt = time.Now()
	return nil
}

// BeforeUpdate sets UpdatedAt before update
func (m *ConfigModel) BeforeUpdate(tx *gorm.DB) error {
	m.UpdatedAt = time.Now()
	return nil
}
