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

// CartItemRepository implements domain.CartItemRepository using GORM
type CartItemRepository struct {
	db *gorm.DB
}

// NewCartItemRepository creates a new CartItemRepository
func NewCartItemRepository(db *gorm.DB) *CartItemRepository {
	return &CartItemRepository{db: db}
}

// Create inserts a new cart item into the database
func (r *CartItemRepository) Create(ctx context.Context, cartItem *domain.CartItem) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.CartItemModel
	model.FromDomain(cartItem)

	return r.db.WithContext(ctx).Create(&model).Error
}

// FindByID retrieves a cart item by ID
func (r *CartItemRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.CartItem, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.CartItemModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return model.ToDomain(), nil
}

// FindByCartID retrieves all cart items for a specific cart
func (r *CartItemRepository) FindByCartID(ctx context.Context, cartID uuid.UUID) ([]*domain.CartItem, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var modelList []models.CartItemModel
	if err := r.db.WithContext(ctx).
		Where("cart_id = ?", cartID).
		Order("added_at DESC").
		Find(&modelList).Error; err != nil {
		return nil, err
	}

	result := make([]*domain.CartItem, len(modelList))
	for i, model := range modelList {
		result[i] = model.ToDomain()
	}
	return result, nil
}

// Update updates an existing cart item
func (r *CartItemRepository) Update(ctx context.Context, cartItem *domain.CartItem) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var model models.CartItemModel
	model.FromDomain(cartItem)

	return r.db.WithContext(ctx).Save(&model).Error
}

// Delete deletes a cart item by ID (hard delete)
func (r *CartItemRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.CartItemModel{}, "id = ?", id).Error
}

// DeleteByCartID deletes all cart items for a specific cart
func (r *CartItemRepository) DeleteByCartID(ctx context.Context, cartID uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.CartItemModel{}, "cart_id = ?", cartID).Error
}
