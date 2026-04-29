package services

import (
	"context"

	"github.com/google/uuid"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/repository"
)

// CartService defines shopping cart operations
type CartService interface {
	CreateCart(ctx context.Context, cart *models.Cart) (*models.Cart, error)
	AddProduct(ctx context.Context, cartProduct *models.CartProduct) (*models.CartProduct, error)
	UpdateProductQuantity(ctx context.Context, cartProduct *models.CartProduct) (*models.CartProduct, error)
	RemoveProduct(ctx context.Context, cartProductID uuid.UUID) error
	GetCartProducts(ctx context.Context, cartID uuid.UUID) ([]*models.CartProduct, error)
	CheckoutCart(ctx context.Context, cartID uuid.UUID) (*models.Cart, error)
}

type cartService struct {
	cartRepo        repository.CartRepository
	cartProductRepo repository.CartProductRepository
	productRepo     repository.ProductRepository
}

func NewCartService(
	cartRepo repository.CartRepository,
	cartProductRepo repository.CartProductRepository,
	productRepo repository.ProductRepository,
) CartService {
	return &cartService{
		cartRepo:        cartRepo,
		cartProductRepo: cartProductRepo,
		productRepo:     productRepo,
	}
}

// CreateCart creates a new shopping cart for a user
func (s *cartService) CreateCart(ctx context.Context, cart *models.Cart) (*models.Cart, error) {
	if err := s.cartRepo.Create(ctx, cart); err != nil {
		return nil, err
	}
	return cart, nil
}

// AddProduct adds a product to a shopping cart
func (s *cartService) AddProduct(ctx context.Context, cartProduct *models.CartProduct) (*models.CartProduct, error) {
	cart, err := s.cartRepo.FindByID(ctx, cartProduct.CartID)
	if err != nil {
		return nil, err
	}

	_, err = s.productRepo.FindByID(ctx, cartProduct.ProductID)
	if err != nil {
		return nil, err
	}

	if err := s.cartProductRepo.Create(ctx, cartProduct); err != nil {
		return nil, err
	}

	if err := s.updateCartTotals(ctx, cart); err != nil {
		return cartProduct, err
	}

	return cartProduct, nil
}

// UpdateProductQuantity updates the quantity of a cart product
func (s *cartService) UpdateProductQuantity(ctx context.Context, cartProduct *models.CartProduct) (*models.CartProduct, error) {
	cart, err := s.cartRepo.FindByID(ctx, cartProduct.CartID)
	if err != nil {
		return nil, err
	}

	if err := s.cartProductRepo.Update(ctx, cartProduct); err != nil {
		return nil, err
	}

	if err := s.updateCartTotals(ctx, cart); err != nil {
		return cartProduct, err
	}

	return cartProduct, nil
}

// RemoveProduct removes an product from a cart
func (s *cartService) RemoveProduct(ctx context.Context, cartProductID uuid.UUID) error {
	cartProduct, err := s.cartProductRepo.FindByID(ctx, cartProductID)
	if err != nil {
		return err
	}

	cart, err := s.cartRepo.FindByID(ctx, cartProduct.CartID)
	if err != nil {
		return err
	}

	if err := s.cartProductRepo.Delete(ctx, cartProductID); err != nil {
		return err
	}

	// Update cart totals
	return s.updateCartTotals(ctx, cart)
}

// GetCartProducts retrieves all products in a cart
func (s *cartService) GetCartProducts(ctx context.Context, cartID uuid.UUID) ([]*models.CartProduct, error) {
	cart, err := s.cartRepo.FindByID(ctx, cartID)
	if err != nil {
		return nil, err
	}

	return s.cartProductRepo.FindByCartID(ctx, cart.ID)
}

// updateCartTotals recalculates and updates the cart's total estimated costs
func (s *cartService) updateCartTotals(ctx context.Context, cart *models.Cart) error {
	cartProducts, err := s.cartProductRepo.FindByCartID(ctx, cart.ID)
	if err != nil {
		return err
	}

	productIDs := make([]uuid.UUID, len(cartProducts))
	for i, item := range cartProducts {
		productIDs[i] = item.ProductID
	}

	products, err := s.productRepo.FindAllByIDs(ctx, productIDs)
	if err != nil {
		return err
	}

	priceMap := make(map[uuid.UUID]struct{ bs, usd int64 })
	for _, p := range products {
		priceMap[p.ID] = struct{ bs, usd int64 }{p.PriceBolivares, p.PriceUsd}
	}

	var totalBs, totalUsd int64
	for _, item := range cartProducts {
		prices := priceMap[item.ProductID]
		totalBs += prices.bs * int64(item.Quantity)
		totalUsd += prices.usd * int64(item.Quantity)
	}

	bs := totalBs
	usd := totalUsd
	cart.TotalEstimatedBs = &bs
	cart.TotalEstimatedUsd = &usd

	return s.cartRepo.Update(ctx, cart)
}

// CheckoutCart marks a cart as completed
func (s *cartService) CheckoutCart(ctx context.Context, cartID uuid.UUID) (*models.Cart, error) {
	cart, err := s.cartRepo.FindByID(ctx, cartID)
	if err != nil {
		return nil, err
	}

	cart.IsActive = false
	if err := s.cartRepo.Update(ctx, cart); err != nil {
		return nil, err
	}

	return cart, nil
}
