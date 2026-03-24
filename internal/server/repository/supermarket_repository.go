package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/pkg/core/errors"
)

// GormSupermarketRepository implements SupermarketRepository using GORM
type GormSupermarketRepository struct {
	db *gorm.DB
}

// NewSupermarketRepository creates a new SupermarketRepository
func NewSupermarketRepository(db *gorm.DB) *GormSupermarketRepository {
	return &GormSupermarketRepository{db: db}
}

// Create inserts a new supermarket into the database
func (r *GormSupermarketRepository) Create(ctx context.Context, supermarket *models.Supermarket) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Create(supermarket).Error
}

// FindByID retrieves a supermarket by ID
func (r *GormSupermarketRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.Supermarket, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var supermarket models.Supermarket
	if err := r.db.WithContext(ctx).First(&supermarket, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return &supermarket, nil
}

// FindByName retrieves supermarkets by name (partial match)
func (r *GormSupermarketRepository) FindByName(ctx context.Context, name string) ([]*models.Supermarket, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var supermarketList []models.Supermarket
	if err := r.db.WithContext(ctx).Where("name ILIKE ?", "%"+name+"%").Find(&supermarketList).Error; err != nil {
		return nil, err
	}

	result := make([]*models.Supermarket, len(supermarketList))
	for i, supermarket := range supermarketList {
		result[i] = &supermarket
	}
	return result, nil
}

// FindByChain retrieves supermarkets by chain name
func (r *GormSupermarketRepository) FindByChain(ctx context.Context, chain string) ([]*models.Supermarket, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var supermarketList []models.Supermarket
	if err := r.db.WithContext(ctx).Where("chain = ?", chain).Find(&supermarketList).Error; err != nil {
		return nil, err
	}

	result := make([]*models.Supermarket, len(supermarketList))
	for i, supermarket := range supermarketList {
		result[i] = &supermarket
	}
	return result, nil
}

// Update updates an existing supermarket
func (r *GormSupermarketRepository) Update(ctx context.Context, supermarket *models.Supermarket) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Save(supermarket).Error
}

// Delete soft deletes a supermarket by ID
func (r *GormSupermarketRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.Supermarket{}, "id = ?", id).Error
}
