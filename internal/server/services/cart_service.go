package services

import (
	"context"

	"github.com/google/uuid"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/repository"
	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"
)

// CartService defines shopping cart operations
type CartService interface {
	CreateCart(ctx context.Context, cart *models.Cart, customSupermarketName *string) (*models.Cart, error)
	AddProduct(ctx context.Context, product *models.Product, cartID uuid.UUID, quantity int, isManualEntry bool) (*models.CartProduct, error)
	UpdateCartProduct(ctx context.Context, cartProductID uuid.UUID, product *models.Product, cartID uuid.UUID, quantity int) (*models.CartProduct, error)
	UpdateProductQuantity(ctx context.Context, cartProduct *models.CartProduct) (*models.CartProduct, error)
	RemoveProduct(ctx context.Context, cartProductID uuid.UUID) error
	GetCartProducts(ctx context.Context, cartID uuid.UUID) ([]*models.CartProduct, error)
	GetCartsByUser(ctx context.Context, userID uuid.UUID, limit int) ([]*models.Cart, error)
	GetCartDetail(ctx context.Context, cartID uuid.UUID) (*models.Cart, []*repository.CartProductDetail, error)
	CheckoutCart(ctx context.Context, cartID uuid.UUID) (*models.Cart, error)
}

type cartService struct {
	cartRepo        repository.CartRepository
	cartProductRepo repository.CartProductRepository
	productRepo     repository.ProductRepository
	supermarketRepo repository.SupermarketRepository
}

func NewCartService(
	cartRepo repository.CartRepository,
	cartProductRepo repository.CartProductRepository,
	productRepo repository.ProductRepository,
	supermarketRepo repository.SupermarketRepository,
) CartService {
	return &cartService{
		cartRepo:        cartRepo,
		cartProductRepo: cartProductRepo,
		productRepo:     productRepo,
		supermarketRepo: supermarketRepo,
	}
}

// CreateCart creates a new shopping cart for a user
func (s *cartService) CreateCart(ctx context.Context, cart *models.Cart, customSupermarketName *string) (*models.Cart, error) {
	if cart.SupermarketID == uuid.Nil && customSupermarketName != nil {
		existing, err := s.supermarketRepo.FindByNameAndUserID(ctx, *customSupermarketName, cart.UserID)
		if err != nil && err != apperrors.ErrNotFound {
			return nil, err
		}
		if existing != nil {
			cart.SupermarketID = existing.ID
		} else {
			newSM := models.NewSupermarket(*customSupermarketName, true, nil, cart.UserID)
			if err := s.supermarketRepo.Create(ctx, newSM); err != nil {
				return nil, err
			}
			cart.SupermarketID = newSM.ID
		}
	}

	if err := s.cartRepo.Create(ctx, cart); err != nil {
		return nil, err
	}
	return cart, nil
}

// AddProduct creates a product and adds it to a shopping cart
func (s *cartService) AddProduct(ctx context.Context, product *models.Product, cartID uuid.UUID, quantity int, isManualEntry bool) (*models.CartProduct, error) {
	_, err := s.cartRepo.FindByID(ctx, cartID)
	if err != nil {
		return nil, err
	}

	if err := s.productRepo.Create(ctx, product); err != nil {
		return nil, err
	}

	cartProduct := models.NewCartProduct(cartID, product.ID, quantity, isManualEntry)
	if err := s.cartProductRepo.Create(ctx, cartProduct); err != nil {
		return nil, err
	}

	cart, err := s.cartRepo.FindByID(ctx, cartID)
	if err != nil {
		return cartProduct, err
	}

	if err := s.updateCartTotals(ctx, cart); err != nil {
		return cartProduct, err
	}

	return cartProduct, nil
}

// UpdateCartProduct updates a cart product and its associated product
func (s *cartService) UpdateCartProduct(ctx context.Context, cartProductID uuid.UUID, product *models.Product, cartID uuid.UUID, quantity int) (*models.CartProduct, error) {
	cartProduct, err := s.cartProductRepo.FindByID(ctx, cartProductID)
	if err != nil {
		return nil, err
	}

	existing, err := s.productRepo.FindByID(ctx, cartProduct.ProductID)
	if err != nil {
		return nil, err
	}

	existing.Name = product.Name
	existing.Barcode = product.Barcode
	existing.IsWeightBased = product.IsWeightBased
	existing.PriceUsd = product.PriceUsd
	existing.PriceBolivares = product.PriceBolivares
	existing.PriceBcv = product.PriceBcv
	existing.ImageUrl = product.ImageUrl

	if err := s.productRepo.Update(ctx, existing); err != nil {
		return nil, err
	}

	cartProduct.Quantity = quantity
	if err := s.cartProductRepo.Update(ctx, cartProduct); err != nil {
		return nil, err
	}

	cart, err := s.cartRepo.FindByID(ctx, cartID)
	if err != nil {
		return cartProduct, err
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

// RemoveProduct removes a product from a cart
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

	return s.updateCartTotals(ctx, cart)
}

// GetCartsByUser retrieves non-deleted carts for a user. If limit > 0, only the first N are returned.
func (s *cartService) GetCartsByUser(ctx context.Context, userID uuid.UUID, limit int) ([]*models.Cart, error) {
	return s.cartRepo.FindByUserID(ctx, userID, limit)
}

// GetCartDetail retrieves a cart with its products and product details
func (s *cartService) GetCartDetail(ctx context.Context, cartID uuid.UUID) (*models.Cart, []*repository.CartProductDetail, error) {
	cart, err := s.cartRepo.FindByID(ctx, cartID)
	if err != nil {
		return nil, nil, err
	}

	products, err := s.cartProductRepo.FindByCartIDWithDetails(ctx, cartID)
	if err != nil {
		return nil, nil, err
	}

	return cart, products, nil
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
	for i, p := range cartProducts {
		productIDs[i] = p.ProductID
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
	for _, p := range cartProducts {
		prices := priceMap[p.ProductID]
		totalBs += prices.bs * int64(p.Quantity)
		totalUsd += prices.usd * int64(p.Quantity)
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
