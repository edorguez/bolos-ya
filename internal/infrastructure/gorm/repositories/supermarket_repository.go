package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	
	"github.com/edorguez/bolos-ya/internal/domain"
	"github.com/edorguez/bolos-ya/internal/infrastructure/gorm/models"
	"github.com/edorguez/bolos-ya/internal/pkg/errors"
)

// SupermarketRepository implements domain.SupermarketRepository using GORM
type SupermarketRepository struct {
	db *gorm.DB
}

// NewSupermarketRepository creates a new SupermarketRepository
func NewSupermarketRepository(db *gorm.DB) *SupermarketRepository {
	return &SupermarketRepository{db: db}
}

// Create inserts a new supermarket into the database
func (r *SupermarketRepository) Create(ctx context.Context, supermarket *domain.Supermarket) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.SupermarketModel
	model.FromDomain(supermarket)

	return r.db.WithContext(ctx).Create(&model).Error
}

// FindByID retrieves a supermarket by ID
func (r *SupermarketRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.Supermarket, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.SupermarketModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return model.ToDomain(), nil
}

// FindByName retrieves supermarkets by name (partial match)
func (r *SupermarketRepository) FindByName(ctx context.Context, name string) ([]*domain.Supermarket, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var modelList []models.SupermarketModel
	if err := r.db.WithContext(ctx).Where("name ILIKE ?", "%"+name+"%").Find(&modelList).Error; err != nil {
		return nil, err
	}

	result := make([]*domain.Supermarket, len(modelList))
	for i, model := range modelList {
		result[i] = model.ToDomain()
	}
	return result, nil
}

// FindByChain retrieves supermarkets by chain name
func (r *SupermarketRepository) FindByChain(ctx context.Context, chain string) ([]*domain.Supermarket, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var modelList []models.SupermarketModel
	if err := r.db.WithContext(ctx).Where("chain = ?", chain).Find(&modelList).Error; err != nil {
		return nil, err
	}

	result := make([]*domain.Supermarket, len(modelList))
	for i, model := range modelList {
		result[i] = model.ToDomain()
	}
	return result, nil
}

// Update updates an existing supermarket
func (r *SupermarketRepository) Update(ctx context.Context, supermarket *domain.Supermarket) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.SupermarketModel
	model.FromDomain(supermarket)

	return r.db.WithContext(ctx).Save(&model).Error
}

// Delete soft deletes a supermarket by ID
func (r *SupermarketRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.SupermarketModel{}, "id = ?", id).Error
}
