package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/pkg/core/errors"
)

type PriceRepository interface {
	Create(ctx context.Context, price *models.Price) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.Price, error)
	FindByProductAndSupermarket(ctx context.Context, productID, supermarketID uuid.UUID) ([]*models.Price, error)
	FindRecentPrices(ctx context.Context, productID, supermarketID uuid.UUID, days int) ([]*models.Price, error)
	Update(ctx context.Context, price *models.Price) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type priceRepository struct {
	db *gorm.DB
}

func NewPriceRepository(db *gorm.DB) PriceRepository {
	return &priceRepository{db: db}
}

// Create inserts a new price into the database
func (r *priceRepository) Create(ctx context.Context, price *models.Price) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Create(price).Error
}

// FindByID retrieves a price by ID
func (r *priceRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.Price, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var price models.Price
	if err := r.db.WithContext(ctx).First(&price, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return &price, nil
}

// FindByProductAndSupermarket retrieves prices for a specific product and supermarket
func (r *priceRepository) FindByProductAndSupermarket(ctx context.Context, productID, supermarketID uuid.UUID) ([]*models.Price, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var priceList []models.Price
	if err := r.db.WithContext(ctx).
		Where("product_id = ? AND supermarket_id = ?", productID, supermarketID).
		Order("captured_at DESC").
		Find(&priceList).Error; err != nil {
		return nil, err
	}

	result := make([]*models.Price, len(priceList))
	for i, price := range priceList {
		result[i] = &price
	}
	return result, nil
}

// FindRecentPrices retrieves prices within the last N days for a product and supermarket
func (r *priceRepository) FindRecentPrices(ctx context.Context, productID, supermarketID uuid.UUID, days int) ([]*models.Price, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	since := time.Now().AddDate(0, 0, -days)
	var priceList []models.Price
	if err := r.db.WithContext(ctx).
		Where("product_id = ? AND supermarket_id = ? AND captured_at >= ?",
			productID, supermarketID, since).
		Order("captured_at DESC").
		Find(&priceList).Error; err != nil {
		return nil, err
	}

	result := make([]*models.Price, len(priceList))
	for i, price := range priceList {
		result[i] = &price
	}
	return result, nil
}

// Update updates an existing price
func (r *priceRepository) Update(ctx context.Context, price *models.Price) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Save(price).Error
}

// Delete deletes a price by ID (hard delete)
func (r *priceRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.Price{}, "id = ?", id).Error
}
