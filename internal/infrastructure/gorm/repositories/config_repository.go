package repositories

import (
	"context"
	"time"

	"gorm.io/gorm"
	
	"github.com/edorguez/bolos-ya/internal/domain"
	"github.com/edorguez/bolos-ya/internal/infrastructure/gorm/models"
	"github.com/edorguez/bolos-ya/internal/pkg/errors"
)

// ConfigRepository implements domain.ConfigRepository using GORM
type ConfigRepository struct {
	db *gorm.DB
}

// NewConfigRepository creates a new ConfigRepository
func NewConfigRepository(db *gorm.DB) *ConfigRepository {
	return &ConfigRepository{db: db}
}

// Set creates or updates a config entry
func (r *ConfigRepository) Set(ctx context.Context, key, value string) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	config := &models.ConfigModel{
		Key:   key,
		Value: value,
	}

	return r.db.WithContext(ctx).Save(config).Error
}

// Get retrieves a config entry by key
func (r *ConfigRepository) Get(ctx context.Context, key string) (*domain.Config, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.ConfigModel
	if err := r.db.WithContext(ctx).First(&model, "key = ?", key).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return model.ToDomain(), nil
}

// Delete removes a config entry by key
func (r *ConfigRepository) Delete(ctx context.Context, key string) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.ConfigModel{}, "key = ?", key).Error
}
