package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/pkg/core/errors"
)

// GormCartItemRepository implements CartItemRepository using GORM
type GormCartItemRepository struct {
	db *gorm.DB
}

// NewCartItemRepository creates a new CartItemRepository
func NewCartItemRepository(db *gorm.DB) *GormCartItemRepository {
	return &GormCartItemRepository{db: db}
}

// Create inserts a new cart item into the database
func (r *GormCartItemRepository) Create(ctx context.Context, cartItem *models.CartItem) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Create(cartItem).Error
}

// FindByID retrieves a cart item by ID
func (r *GormCartItemRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.CartItem, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var cartItem models.CartItem
	if err := r.db.WithContext(ctx).First(&cartItem, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return &cartItem, nil
}

// FindByCartID retrieves all cart items for a specific cart
func (r *GormCartItemRepository) FindByCartID(ctx context.Context, cartID uuid.UUID) ([]*models.CartItem, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var cartItemList []models.CartItem
	if err := r.db.WithContext(ctx).
		Where("cart_id = ?", cartID).
		Order("added_at DESC").
		Find(&cartItemList).Error; err != nil {
		return nil, err
	}

	result := make([]*models.CartItem, len(cartItemList))
	for i, cartItem := range cartItemList {
		result[i] = &cartItem
	}
	return result, nil
}

// Update updates an existing cart item
func (r *GormCartItemRepository) Update(ctx context.Context, cartItem *models.CartItem) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Save(cartItem).Error
}

// Delete deletes a cart item by ID (hard delete)
func (r *GormCartItemRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.CartItem{}, "id = ?", id).Error
}

// DeleteByCartID deletes all cart items for a specific cart
func (r *GormCartItemRepository) DeleteByCartID(ctx context.Context, cartID uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.CartItem{}, "cart_id = ?", cartID).Error
}
