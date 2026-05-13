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
	FindByUserID(ctx context.Context, userID uuid.UUID, limit int) ([]*models.Cart, error)
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
	if err := r.db.WithContext(ctx).Preload("Supermarket").First(&cart, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return &cart, nil
}

// FindByUserID retrieves non-deleted carts for a specific user, ordered by created_at DESC.
// If limit > 0, only the first N carts are returned.
func (r *cartRepository) FindByUserID(ctx context.Context, userID uuid.UUID, limit int) ([]*models.Cart, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	query := r.db.WithContext(ctx).
		Where("user_id = ? AND deleted_at IS NULL", userID).
		Preload("Supermarket").
		Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	var cartList []models.Cart
	if err := query.Find(&cartList).Error; err != nil {
		return nil, err
	}

	result := make([]*models.Cart, len(cartList))
	for i := range cartList {
		result[i] = &cartList[i]
	}
	return result, nil
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
