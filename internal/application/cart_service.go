package application

import (
	"context"
	"errors"

	"github.com/google/uuid"
	
	"github.com/edorguez/bolos-ya/internal/domain"
	apperrors "github.com/edorguez/bolos-ya/internal/pkg/errors"
)

// CartService handles shopping cart operations
type CartService struct {
	cartRepo     domain.CartRepository
	cartItemRepo domain.CartItemRepository
	productRepo  domain.ProductRepository
	priceRepo    domain.PriceRepository
}

// NewCartService creates a new CartService
func NewCartService(
	cartRepo domain.CartRepository,
	cartItemRepo domain.CartItemRepository,
	productRepo domain.ProductRepository,
	priceRepo domain.PriceRepository,
) *CartService {
	return &CartService{
		cartRepo:     cartRepo,
		cartItemRepo: cartItemRepo,
		productRepo:  productRepo,
		priceRepo:    priceRepo,
	}
}

// CreateCartRequest contains data for creating a new cart
type CreateCartRequest struct {
	UserID        uuid.UUID
	SupermarketID uuid.UUID
	BudgetBs      int64
	BudgetUsd     int64
}

// CreateCart creates a new shopping cart for a user
func (s *CartService) CreateCart(ctx context.Context, req CreateCartRequest) (*domain.Cart, error) {
	// Check if user already has an active cart
	activeCart, err := s.cartRepo.FindActiveByUserID(ctx, req.UserID)
	if err == nil && activeCart != nil {
		return nil, apperrors.ErrConflict
	}
	if err != nil && !errors.Is(err, apperrors.ErrNotFound) {
		return nil, err
	}

	cart := domain.NewCart(req.UserID, req.SupermarketID)
	cart.BudgetBs = req.BudgetBs
	cart.BudgetUsd = req.BudgetUsd

	if err := s.cartRepo.Create(ctx, cart); err != nil {
		return nil, err
	}

	return cart, nil
}

// AddItemRequest contains data for adding an item to a cart
type AddItemRequest struct {
	CartID    uuid.UUID
	ProductID uuid.UUID
	Quantity  int
}

// AddItem adds a product to a shopping cart
func (s *CartService) AddItem(ctx context.Context, req AddItemRequest) (*domain.CartItem, error) {
	// Verify cart exists and is active
	cart, err := s.cartRepo.FindByID(ctx, req.CartID)
	if err != nil {
		return nil, err
	}
	if !cart.IsActive() {
		return nil, apperrors.ErrConflict
	}

	// Verify product exists
	_, err = s.productRepo.FindByID(ctx, req.ProductID)
	if err != nil {
		return nil, err
	}

	// Get current price for the product at this supermarket
	prices, err := s.priceRepo.FindRecentPrices(ctx, req.ProductID, cart.SupermarketID, 7)
	if err != nil && !errors.Is(err, apperrors.ErrNotFound) {
		return nil, err
	}

	var priceSnapshotBs, priceSnapshotUsd *int64
	if len(prices) > 0 {
		latestPrice := prices[0]
		priceSnapshotBs = &latestPrice.PriceBolivares
		priceSnapshotUsd = &latestPrice.PriceUSD
	}

	cartItem := domain.NewCartItem(req.CartID, req.ProductID, req.Quantity)
	cartItem.PriceSnapshotBs = priceSnapshotBs
	cartItem.PriceSnapshotUsd = priceSnapshotUsd

	if err := s.cartItemRepo.Create(ctx, cartItem); err != nil {
		return nil, err
	}

	// Update cart totals
	if err := s.updateCartTotals(ctx, cart); err != nil {
		// Rollback item creation? For simplicity, we'll just log the error
		// In production, we would use a transaction
		return cartItem, err
	}

	return cartItem, nil
}

// UpdateItemQuantityRequest contains data for updating item quantity
type UpdateItemQuantityRequest struct {
	CartItemID uuid.UUID
	Quantity   int
}

// UpdateItemQuantity updates the quantity of a cart item
func (s *CartService) UpdateItemQuantity(ctx context.Context, req UpdateItemQuantityRequest) (*domain.CartItem, error) {
	cartItem, err := s.cartItemRepo.FindByID(ctx, req.CartItemID)
	if err != nil {
		return nil, err
	}

	cart, err := s.cartRepo.FindByID(ctx, cartItem.CartID)
	if err != nil {
		return nil, err
	}
	if !cart.IsActive() {
		return nil, apperrors.ErrConflict
	}

	cartItem.Quantity = req.Quantity
	if err := s.cartItemRepo.Update(ctx, cartItem); err != nil {
		return nil, err
	}

	// Update cart totals
	if err := s.updateCartTotals(ctx, cart); err != nil {
		return cartItem, err
	}

	return cartItem, nil
}

// RemoveItem removes an item from a cart
func (s *CartService) RemoveItem(ctx context.Context, cartItemID uuid.UUID) error {
	cartItem, err := s.cartItemRepo.FindByID(ctx, cartItemID)
	if err != nil {
		return err
	}

	cart, err := s.cartRepo.FindByID(ctx, cartItem.CartID)
	if err != nil {
		return err
	}
	if !cart.IsActive() {
		return apperrors.ErrConflict
	}

	if err := s.cartItemRepo.Delete(ctx, cartItemID); err != nil {
		return err
	}

	// Update cart totals
	return s.updateCartTotals(ctx, cart)
}

// GetCartItems retrieves all items in a cart
func (s *CartService) GetCartItems(ctx context.Context, cartID uuid.UUID) ([]*domain.CartItem, error) {
	cart, err := s.cartRepo.FindByID(ctx, cartID)
	if err != nil {
		return nil, err
	}

	return s.cartItemRepo.FindByCartID(ctx, cart.ID)
}

// updateCartTotals recalculates and updates the cart's total estimated costs
func (s *CartService) updateCartTotals(ctx context.Context, cart *domain.Cart) error {
	items, err := s.cartItemRepo.FindByCartID(ctx, cart.ID)
	if err != nil {
		return err
	}

	var totalBs, totalUsd int64
	for _, item := range items {
		if item.SubtotalBolivares() != nil {
			totalBs += *item.SubtotalBolivares()
		}
		if item.SubtotalUSD() != nil {
			totalUsd += *item.SubtotalUSD()
		}
	}

	cart.TotalEstimatedBs = totalBs
	cart.TotalEstimatedUsd = totalUsd

	return s.cartRepo.Update(ctx, cart)
}

// CheckoutCart marks a cart as completed
func (s *CartService) CheckoutCart(ctx context.Context, cartID uuid.UUID) (*domain.Cart, error) {
	cart, err := s.cartRepo.FindByID(ctx, cartID)
	if err != nil {
		return nil, err
	}

	if !cart.IsActive() {
		return nil, apperrors.ErrConflict
	}

	cart.Status = domain.CartStatusCompleted
	if err := s.cartRepo.Update(ctx, cart); err != nil {
		return nil, err
	}

	return cart, nil
}
