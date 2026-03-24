package repository

import (
	"context"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/google/uuid"
)

// UserRepository defines operations for User persistence
type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	FindByEmail(ctx context.Context, email string) (*models.User, error)
	FindByGoogleID(ctx context.Context, googleID string) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// SupermarketRepository defines operations for Supermarket persistence
type SupermarketRepository interface {
	Create(ctx context.Context, supermarket *models.Supermarket) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.Supermarket, error)
	FindByName(ctx context.Context, name string) ([]*models.Supermarket, error)
	FindByChain(ctx context.Context, chain string) ([]*models.Supermarket, error)
	Update(ctx context.Context, supermarket *models.Supermarket) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// ProductRepository defines operations for Product persistence
type ProductRepository interface {
	Create(ctx context.Context, product *models.Product) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.Product, error)
	FindByName(ctx context.Context, name string) ([]*models.Product, error)
	FindByBarcode(ctx context.Context, barcode string) (*models.Product, error)
	Update(ctx context.Context, product *models.Product) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// PriceRepository defines operations for Price persistence
type PriceRepository interface {
	Create(ctx context.Context, price *models.Price) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.Price, error)
	FindByProductAndSupermarket(ctx context.Context, productID, supermarketID uuid.UUID) ([]*models.Price, error)
	FindRecentPrices(ctx context.Context, productID, supermarketID uuid.UUID, days int) ([]*models.Price, error)
	Update(ctx context.Context, price *models.Price) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// CartRepository defines operations for Cart persistence
type CartRepository interface {
	Create(ctx context.Context, cart *models.Cart) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.Cart, error)
	FindByUserID(ctx context.Context, userID uuid.UUID, status models.CartStatus) ([]*models.Cart, error)
	FindActiveByUserID(ctx context.Context, userID uuid.UUID) (*models.Cart, error)
	Update(ctx context.Context, cart *models.Cart) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// CartItemRepository defines operations for CartItem persistence
type CartItemRepository interface {
	Create(ctx context.Context, cartItem *models.CartItem) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.CartItem, error)
	FindByCartID(ctx context.Context, cartID uuid.UUID) ([]*models.CartItem, error)
	Update(ctx context.Context, cartItem *models.CartItem) error
	Delete(ctx context.Context, id uuid.UUID) error
	DeleteByCartID(ctx context.Context, cartID uuid.UUID) error
}

// ConfigRepository defines operations for Config persistence
type ConfigRepository interface {
	Set(ctx context.Context, key, value string) error
	Get(ctx context.Context, key string) (*models.Config, error)
	Delete(ctx context.Context, key string) error
}
