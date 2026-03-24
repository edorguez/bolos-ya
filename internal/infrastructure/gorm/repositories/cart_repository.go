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

// CartRepository implements domain.CartRepository using GORM
type CartRepository struct {
	db *gorm.DB
}

// NewCartRepository creates a new CartRepository
func NewCartRepository(db *gorm.DB) *CartRepository {
	return &CartRepository{db: db}
}

// Create inserts a new cart into the database
func (r *CartRepository) Create(ctx context.Context, cart *domain.Cart) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.CartModel
	model.FromDomain(cart)

	return r.db.WithContext(ctx).Create(&model).Error
}

// FindByID retrieves a cart by ID
func (r *CartRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.Cart, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.CartModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return model.ToDomain(), nil
}

// FindByUserID retrieves carts for a specific user, optionally filtered by status
func (r *CartRepository) FindByUserID(ctx context.Context, userID uuid.UUID, status domain.CartStatus) ([]*domain.Cart, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var modelList []models.CartModel
	query := r.db.WithContext(ctx).Where("user_id = ?", userID)
	if status != "" {
		query = query.Where("status = ?", status)
	}
	
	if err := query.Order("created_at DESC").Find(&modelList).Error; err != nil {
		return nil, err
	}

	result := make([]*domain.Cart, len(modelList))
	for i, model := range modelList {
		result[i] = model.ToDomain()
	}
	return result, nil
}

// FindActiveByUserID retrieves the active cart for a user
func (r *CartRepository) FindActiveByUserID(ctx context.Context, userID uuid.UUID) (*domain.Cart, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.CartModel
	if err := r.db.WithContext(ctx).
		Where("user_id = ? AND status = ?", userID, domain.CartStatusActive).
		First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return model.ToDomain(), nil
}

// Update updates an existing cart
func (r *CartRepository) Update(ctx context.Context, cart *domain.Cart) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.CartModel
	model.FromDomain(cart)

	return r.db.WithContext(ctx).Save(&model).Error
}

// Delete deletes a cart by ID (hard delete)
func (r *CartRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.CartModel{}, "id = ?", id).Error
}
