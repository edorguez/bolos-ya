package domain

import (
	"time"
)

// Config represents a configuration key-value pair
type Config struct {
	Key       string    `json:"key"`
	Value     string    `json:"value"`
	UpdatedAt time.Time `json:"updatedAt"`
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
