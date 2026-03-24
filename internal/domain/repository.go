package domain

import (
	"context"

	"github.com/google/uuid"
)

// UserRepository defines operations for User persistence
type UserRepository interface {
	Create(ctx context.Context, user *User) error
	FindByID(ctx context.Context, id uuid.UUID) (*User, error)
	FindByEmail(ctx context.Context, email string) (*User, error)
	FindByGoogleID(ctx context.Context, googleID string) (*User, error)
	Update(ctx context.Context, user *User) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// SupermarketRepository defines operations for Supermarket persistence
type SupermarketRepository interface {
	Create(ctx context.Context, supermarket *Supermarket) error
	FindByID(ctx context.Context, id uuid.UUID) (*Supermarket, error)
	FindByName(ctx context.Context, name string) ([]*Supermarket, error)
	FindByChain(ctx context.Context, chain string) ([]*Supermarket, error)
	Update(ctx context.Context, supermarket *Supermarket) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// ProductRepository defines operations for Product persistence
type ProductRepository interface {
	Create(ctx context.Context, product *Product) error
	FindByID(ctx context.Context, id uuid.UUID) (*Product, error)
	FindByName(ctx context.Context, name string) ([]*Product, error)
	FindByBarcode(ctx context.Context, barcode string) (*Product, error)
	Update(ctx context.Context, product *Product) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// PriceRepository defines operations for Price persistence
type PriceRepository interface {
	Create(ctx context.Context, price *Price) error
	FindByID(ctx context.Context, id uuid.UUID) (*Price, error)
	FindByProductAndSupermarket(ctx context.Context, productID, supermarketID uuid.UUID) ([]*Price, error)
	FindRecentPrices(ctx context.Context, productID, supermarketID uuid.UUID, days int) ([]*Price, error)
	Update(ctx context.Context, price *Price) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// CartRepository defines operations for Cart persistence
type CartRepository interface {
	Create(ctx context.Context, cart *Cart) error
	FindByID(ctx context.Context, id uuid.UUID) (*Cart, error)
	FindByUserID(ctx context.Context, userID uuid.UUID, status CartStatus) ([]*Cart, error)
	FindActiveByUserID(ctx context.Context, userID uuid.UUID) (*Cart, error)
	Update(ctx context.Context, cart *Cart) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// CartItemRepository defines operations for CartItem persistence
type CartItemRepository interface {
	Create(ctx context.Context, cartItem *CartItem) error
	FindByID(ctx context.Context, id uuid.UUID) (*CartItem, error)
	FindByCartID(ctx context.Context, cartID uuid.UUID) ([]*CartItem, error)
	Update(ctx context.Context, cartItem *CartItem) error
	Delete(ctx context.Context, id uuid.UUID) error
	DeleteByCartID(ctx context.Context, cartID uuid.UUID) error
}

// ConfigRepository defines operations for Config persistence
type ConfigRepository interface {
	Set(ctx context.Context, key, value string) error
	Get(ctx context.Context, key string) (*Config, error)
	Delete(ctx context.Context, key string) error
}
