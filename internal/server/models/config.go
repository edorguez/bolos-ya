package models

import (
	"time"

	"gorm.io/gorm"
)

// Config represents a configuration key-value pair
type Config struct {
	Key       string `gorm:"type:varchar(100);primaryKey"`
	Value     string `gorm:"type:text"`
	UpdatedAt time.Time
}

// TableName returns the table name for the model
func (Config) TableName() string {
	return "config"
}

// NewConfig creates a new Config entry
func NewConfig(key, value string) *Config {
	now := time.Now()
	return &Config{
		Key:       key,
		Value:     value,
		UpdatedAt: now,
	}
}

// BeforeCreate sets UpdatedAt before creation
func (c *Config) BeforeCreate(tx *gorm.DB) error {
	c.UpdatedAt = time.Now()
	return nil
}

// BeforeUpdate sets UpdatedAt before update
func (c *Config) BeforeUpdate(tx *gorm.DB) error {
	c.UpdatedAt = time.Now()
	return nil
}
