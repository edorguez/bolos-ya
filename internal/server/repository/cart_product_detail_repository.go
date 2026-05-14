package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type CartProductDetail struct {
	ID             uuid.UUID
	CartID         uuid.UUID
	ProductID      uuid.UUID
	Name           string
	PriceBolivares int64
	PriceUsd       int64
	ImageUrl       *string
	Quantity       int
	IsManualEntry  bool
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

func (r *cartProductRepository) FindByCartIDWithDetails(ctx context.Context, cartID uuid.UUID) ([]*CartProductDetail, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var results []CartProductDetail
	if err := r.db.WithContext(ctx).
		Table("cart_products").
		Select(`cart_products.id, cart_products.cart_id, cart_products.product_id,
			COALESCE(products.name, '') as name,
			COALESCE(products.price_bolivares, 0) as price_bolivares,
			COALESCE(products.price_usd, 0) as price_usd,
			products.image_url,
			cart_products.quantity, cart_products.is_manual_entry,
			cart_products.created_at, cart_products.updated_at`).
		Joins("LEFT JOIN products ON products.id = cart_products.product_id").
		Where("cart_products.cart_id = ? AND cart_products.deleted_at IS NULL", cartID).
		Order("cart_products.created_at DESC").
		Scan(&results).Error; err != nil {
		return nil, err
	}

	pointers := make([]*CartProductDetail, len(results))
	for i := range results {
		pointers[i] = &results[i]
	}
	return pointers, nil
}
