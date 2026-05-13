package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/pkg/core/errors"
)

type CartProductRepository interface {
	Create(ctx context.Context, cartProduct *models.CartProduct) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.CartProduct, error)
	FindByCartID(ctx context.Context, cartID uuid.UUID) ([]*models.CartProduct, error)
	FindByCartIDWithDetails(ctx context.Context, cartID uuid.UUID) ([]*CartProductDetail, error)
	Update(ctx context.Context, cartProduct *models.CartProduct) error
	Delete(ctx context.Context, id uuid.UUID) error
	DeleteByCartID(ctx context.Context, cartID uuid.UUID) error
}

type cartProductRepository struct {
	db *gorm.DB
}

// NewCartProductRepository creates a new CartProductRepository
func NewCartProductRepository(db *gorm.DB) CartProductRepository {
	return &cartProductRepository{db: db}
}

// Create inserts a new cart product into the database
func (r *cartProductRepository) Create(ctx context.Context, cartProduct *models.CartProduct) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Create(cartProduct).Error
}

// FindByID retrieves a cart product by ID
func (r *cartProductRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.CartProduct, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var cartProduct models.CartProduct
	if err := r.db.WithContext(ctx).First(&cartProduct, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return &cartProduct, nil
}

// FindByCartID retrieves all cart products for a specific cart
func (r *cartProductRepository) FindByCartID(ctx context.Context, cartID uuid.UUID) ([]*models.CartProduct, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var cartProductList []models.CartProduct
	if err := r.db.WithContext(ctx).
		Where("cart_id = ?", cartID).
		Order("added_at DESC").
		Find(&cartProductList).Error; err != nil {
		return nil, err
	}

	result := make([]*models.CartProduct, len(cartProductList))
	for i, cartItem := range cartProductList {
		result[i] = &cartItem
	}
	return result, nil
}

// Update updates an existing cart product
func (r *cartProductRepository) Update(ctx context.Context, cartItem *models.CartProduct) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Save(cartItem).Error
}

// Delete deletes a cart product by ID (hard delete)
func (r *cartProductRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.CartProduct{}, "id = ?", id).Error
}

// DeleteByCartID deletes all cart products for a specific cart
func (r *cartProductRepository) DeleteByCartID(ctx context.Context, cartID uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.CartProduct{}, "cart_id = ?", cartID).Error
}
