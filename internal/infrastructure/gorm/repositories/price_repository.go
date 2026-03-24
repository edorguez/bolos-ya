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

// PriceRepository implements domain.PriceRepository using GORM
type PriceRepository struct {
	db *gorm.DB
}

// NewPriceRepository creates a new PriceRepository
func NewPriceRepository(db *gorm.DB) *PriceRepository {
	return &PriceRepository{db: db}
}

// Create inserts a new price into the database
func (r *PriceRepository) Create(ctx context.Context, price *domain.Price) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.PriceModel
	model.FromDomain(price)

	return r.db.WithContext(ctx).Create(&model).Error
}

// FindByID retrieves a price by ID
func (r *PriceRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.Price, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.PriceModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return model.ToDomain(), nil
}

// FindByProductAndSupermarket retrieves prices for a specific product and supermarket
func (r *PriceRepository) FindByProductAndSupermarket(ctx context.Context, productID, supermarketID uuid.UUID) ([]*domain.Price, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var modelList []models.PriceModel
	if err := r.db.WithContext(ctx).
		Where("product_id = ? AND supermarket_id = ?", productID, supermarketID).
		Order("captured_at DESC").
		Find(&modelList).Error; err != nil {
		return nil, err
	}

	result := make([]*domain.Price, len(modelList))
	for i, model := range modelList {
		result[i] = model.ToDomain()
	}
	return result, nil
}

// FindRecentPrices retrieves prices within the last N days for a product and supermarket
func (r *PriceRepository) FindRecentPrices(ctx context.Context, productID, supermarketID uuid.UUID, days int) ([]*domain.Price, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	since := time.Now().AddDate(0, 0, -days)
	var modelList []models.PriceModel
	if err := r.db.WithContext(ctx).
		Where("product_id = ? AND supermarket_id = ? AND captured_at >= ?", 
			productID, supermarketID, since).
		Order("captured_at DESC").
		Find(&modelList).Error; err != nil {
		return nil, err
	}

	result := make([]*domain.Price, len(modelList))
	for i, model := range modelList {
		result[i] = model.ToDomain()
	}
	return result, nil
}

// Update updates an existing price
func (r *PriceRepository) Update(ctx context.Context, price *domain.Price) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.PriceModel
	model.FromDomain(price)

	return r.db.WithContext(ctx).Save(&model).Error
}

// Delete deletes a price by ID (hard delete)
func (r *PriceRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.PriceModel{}, "id = ?", id).Error
}
