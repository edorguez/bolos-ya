package repository

import (
	"context"
	"time"

	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/pkg/core/errors"
)

// GormConfigRepository implements ConfigRepository using GORM
type GormConfigRepository struct {
	db *gorm.DB
}

// NewConfigRepository creates a new ConfigRepository
func NewConfigRepository(db *gorm.DB) *GormConfigRepository {
	return &GormConfigRepository{db: db}
}

// Set creates or updates a config entry
func (r *GormConfigRepository) Set(ctx context.Context, key, value string) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	config := &models.Config{
		Key:   key,
		Value: value,
	}

	return r.db.WithContext(ctx).Save(config).Error
}

// Get retrieves a config entry by key
func (r *GormConfigRepository) Get(ctx context.Context, key string) (*models.Config, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var config models.Config
	if err := r.db.WithContext(ctx).First(&config, "key = ?", key).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return &config, nil
}

// Delete removes a config entry by key
func (r *GormConfigRepository) Delete(ctx context.Context, key string) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.Config{}, "key = ?", key).Error
}
