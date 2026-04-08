package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"

	"github.com/edorguez/bolos-ya/internal/server/services"
	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"
	"github.com/edorguez/bolos-ya/pkg/utils"
)

// CartHandler handles shopping cart HTTP requests
type CartHandler struct {
	cartService services.CartService
}

// NewCartHandler creates a new CartHandler
func NewCartHandler(cartService services.CartService) *CartHandler {
	return &CartHandler{
		cartService: cartService,
	}
}

// CreateCart handles creating a new shopping cart
func (h *CartHandler) CreateCart(c *gin.Context) {
	var req services.CreateCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleValidationError(c, err)
		return
	}

	cart, err := h.cartService.CreateCart(c.Request.Context(), req)
	if err != nil {
		h.handleError(c, err)
		return
	}

	utils.SuccessResponse(c, cart)
}

// AddProduct handles adding an product to a cart
func (h *CartHandler) AddProduct(c *gin.Context) {
	var req services.AddProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleValidationError(c, err)
		return
	}

	cartProduct, err := h.cartService.AddProduct(c.Request.Context(), req)
	if err != nil {
		h.handleError(c, err)
		return
	}

	utils.SuccessResponse(c, cartProduct)
}

// UpdateProductQuantity handles updating cart product quantity
func (h *CartHandler) UpdateProductQuantity(c *gin.Context) {
	var req services.UpdateProductQuantityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleValidationError(c, err)
		return
	}

	cartItem, err := h.cartService.UpdateProductQuantity(c.Request.Context(), req)
	if err != nil {
		h.handleError(c, err)
		return
	}

	utils.SuccessResponse(c, cartItem)
}

// RemoveItem handles removing an item from a cart
func (h *CartHandler) RemoveItem(c *gin.Context) {
	cartItemID, err := utils.ParseUUID(c.Param("cartItemId"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid cart item ID")
		return
	}

	if err := h.cartService.RemoveProduct(c.Request.Context(), cartItemID); err != nil {
		h.handleError(c, err)
		return
	}

	utils.SuccessResponse(c, nil)
}

// GetCartItems handles retrieving cart items
func (h *CartHandler) GetCartItems(c *gin.Context) {
	cartID, err := utils.ParseUUID(c.Param("cartId"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid cart ID")
		return
	}

	items, err := h.cartService.GetCartProducts(c.Request.Context(), cartID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	utils.SuccessResponse(c, items)
}

// CheckoutCart handles cart checkout
func (h *CartHandler) CheckoutCart(c *gin.Context) {
	cartID, err := utils.ParseUUID(c.Param("cartId"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid cart ID")
		return
	}

	cart, err := h.cartService.CheckoutCart(c.Request.Context(), cartID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	utils.SuccessResponse(c, cart)
}

// handleValidationError converts validation errors to proper HTTP response
func (h *CartHandler) handleValidationError(c *gin.Context, err error) {
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		errorsMap := make(map[string]string)
		for _, fieldErr := range validationErrors {
			errorsMap[fieldErr.Field()] = fieldErr.Tag()
		}
		utils.ValidationError(c, errorsMap)
	} else {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
	}
}

// handleError maps service errors to HTTP responses
func (h *CartHandler) handleError(c *gin.Context, err error) {
	switch err {
	case apperrors.ErrConflict:
		utils.ErrorResponse(c, http.StatusConflict, "cart conflict")
	case apperrors.ErrNotFound:
		utils.NotFoundResponse(c, "resource")
	default:
		utils.InternalErrorResponse(c)
	}
}
