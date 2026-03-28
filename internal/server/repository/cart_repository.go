package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/pkg/core/errors"
)

type CartRepository interface {
	Create(ctx context.Context, cart *models.Cart) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.Cart, error)
	FindByUserID(ctx context.Context, userID uuid.UUID, status models.CartStatus) ([]*models.Cart, error)
	FindActiveByUserID(ctx context.Context, userID uuid.UUID) (*models.Cart, error)
	Update(ctx context.Context, cart *models.Cart) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type cartRepository struct {
	db *gorm.DB
}

func NewCartRepository(db *gorm.DB) CartRepository {
	return &cartRepository{db: db}
}

// Create inserts a new cart into the database
func (r *cartRepository) Create(ctx context.Context, cart *models.Cart) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Create(cart).Error
}

// FindByID retrieves a cart by ID
func (r *cartRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.Cart, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var cart models.Cart
	if err := r.db.WithContext(ctx).First(&cart, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return &cart, nil
}

// FindByUserID retrieves carts for a specific user, optionally filtered by status
func (r *cartRepository) FindByUserID(ctx context.Context, userID uuid.UUID, status models.CartStatus) ([]*models.Cart, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var cartList []models.Cart
	query := r.db.WithContext(ctx).Where("user_id = ?", userID)
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Order("created_at DESC").Find(&cartList).Error; err != nil {
		return nil, err
	}

	result := make([]*models.Cart, len(cartList))
	for i, cart := range cartList {
		result[i] = &cart
	}
	return result, nil
}

// FindActiveByUserID retrieves the active cart for a user
func (r *cartRepository) FindActiveByUserID(ctx context.Context, userID uuid.UUID) (*models.Cart, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var cart models.Cart
	if err := r.db.WithContext(ctx).
		Where("user_id = ? AND status = ?", userID, models.CartStatusActive).
		First(&cart).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return &cart, nil
}

// Update updates an existing cart
func (r *cartRepository) Update(ctx context.Context, cart *models.Cart) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Save(cart).Error
}

// Delete deletes a cart by ID (hard delete)
func (r *cartRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.Cart{}, "id = ?", id).Error
}
