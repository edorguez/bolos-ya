package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/pkg/core/errors"
)

type SupermarketRepository interface {
	Create(ctx context.Context, supermarket *models.Supermarket) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.Supermarket, error)
	FindByName(ctx context.Context, name string) ([]*models.Supermarket, error)
	Update(ctx context.Context, supermarket *models.Supermarket) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type supermarketRepository struct {
	db *gorm.DB
}

func NewSupermarketRepository(db *gorm.DB) SupermarketRepository {
	return &supermarketRepository{db: db}
}

// Create inserts a new supermarket into the database
func (r *supermarketRepository) Create(ctx context.Context, supermarket *models.Supermarket) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Create(supermarket).Error
}

// FindByID retrieves a supermarket by ID
func (r *supermarketRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.Supermarket, error) {
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
func (r *supermarketRepository) FindByName(ctx context.Context, name string) ([]*models.Supermarket, error) {
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

// Update updates an existing supermarket
func (r *supermarketRepository) Update(ctx context.Context, supermarket *models.Supermarket) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Save(supermarket).Error
}

// Delete soft deletes a supermarket by ID
func (r *supermarketRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.Supermarket{}, "id = ?", id).Error
}
