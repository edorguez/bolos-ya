package services

import (
	"context"
	"errors"

	"github.com/google/uuid"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/repository"
	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"
)

// CartService defines shopping cart operations
type CartService interface {
	CreateCart(ctx context.Context, req CreateCartRequest) (*models.Cart, error)
	AddProduct(ctx context.Context, req AddProductRequest) (*models.CartProduct, error)
	UpdateItemQuantity(ctx context.Context, req UpdateItemQuantityRequest) (*models.CartItem, error)
	RemoveItem(ctx context.Context, cartItemID uuid.UUID) error
	GetCartItems(ctx context.Context, cartID uuid.UUID) ([]*models.CartItem, error)
	CheckoutCart(ctx context.Context, cartID uuid.UUID) (*models.Cart, error)
}

type cartService struct {
	cartRepo        repository.CartRepository
	cartProductRepo repository.CartProductRepository
	productRepo     repository.ProductRepository
}

func NewCartService(
	cartRepo repository.CartRepository,
	cartItemRepo repository.CartItemRepository,
	productRepo repository.ProductRepository,
	priceRepo repository.PriceRepository,
) CartService {
	return &cartService{
		cartRepo:     cartRepo,
		cartItemRepo: cartItemRepo,
		productRepo:  productRepo,
		priceRepo:    priceRepo,
	}
}

// CreateCartRequest contains data for creating a new cart
type CreateCartRequest struct {
	UserID        uuid.UUID `json:"userId" binding:"required"`
	SupermarketID uuid.UUID `json:"supermarketId" binding:"required"`
	BudgetBs      int64     `json:"budgetBs" binding:"min=0"`
	BudgetUsd     int64     `json:"budgetUsd" binding:"min=0"`
}

// CreateCart creates a new shopping cart for a user
func (s *cartService) CreateCart(ctx context.Context, req CreateCartRequest) (*models.Cart, error) {
	cart := models.NewCart(
		req.UserID,
		req.SupermarketID,
		true,
		req.BudgetBs,
		req.BudgetUsd,
	)

	if err := s.cartRepo.Create(ctx, cart); err != nil {
		return nil, err
	}

	return cart, nil
}

// AddProductRequest contains data for adding a product to a cart
type AddProductRequest struct {
	CartID    uuid.UUID `json:"cartId" binding:"required"`
	ProductID uuid.UUID `json:"productId" binding:"required"`
	Quantity  int       `json:"quantity" binding:"required,min=1"`
}

// AddProduct adds a product to a shopping cart
func (s *cartService) AddItem(ctx context.Context, req AddProductRequest) (*models.CartProduct, error) {
	// Verify cart exists
	cart, err := s.cartRepo.FindByID(ctx, req.CartID)
	if err != nil {
		return nil, err
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

	cartItem := models.NewCartItem(req.CartID, req.ProductID, req.Quantity)

	if err := s.cartProductRepo.Create(ctx, cartItem); err != nil {
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
	CartItemID uuid.UUID `json:"cartItemId" binding:"required"`
	Quantity   int       `json:"quantity" binding:"required,min=1"`
}

// UpdateItemQuantity updates the quantity of a cart item
func (s *cartService) UpdateItemQuantity(ctx context.Context, req UpdateItemQuantityRequest) (*models.CartItem, error) {
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
func (s *cartService) RemoveItem(ctx context.Context, cartItemID uuid.UUID) error {
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
func (s *cartService) GetCartItems(ctx context.Context, cartID uuid.UUID) ([]*models.CartItem, error) {
	cart, err := s.cartRepo.FindByID(ctx, cartID)
	if err != nil {
		return nil, err
	}

	return s.cartItemRepo.FindByCartID(ctx, cart.ID)
}

// updateCartTotals recalculates and updates the cart's total estimated costs
func (s *cartService) updateCartTotals(ctx context.Context, cart *models.Cart) error {
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
func (s *cartService) CheckoutCart(ctx context.Context, cartID uuid.UUID) (*models.Cart, error) {
	cart, err := s.cartRepo.FindByID(ctx, cartID)
	if err != nil {
		return nil, err
	}

	if !cart.IsActive() {
		return nil, apperrors.ErrConflict
	}

	cart.Status = models.CartStatusCompleted
	if err := s.cartRepo.Update(ctx, cart); err != nil {
		return nil, err
	}

	return cart, nil
}
