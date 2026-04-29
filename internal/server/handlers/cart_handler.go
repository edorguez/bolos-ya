package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/edorguez/bolos-ya/internal/server/dto"
	"github.com/edorguez/bolos-ya/internal/server/middleware"
	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/services"
	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"
	"github.com/edorguez/bolos-ya/pkg/utils"
)

type CartHandler struct {
	cartService services.CartService
}

func NewCartHandler(cartService services.CartService) *CartHandler {
	return &CartHandler{
		cartService: cartService,
	}
}

func (h *CartHandler) CreateCart(c *gin.Context) {
	var req dto.CreateCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationError(c, dto.ValidateRequest(req))
		return
	}

	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		utils.UnauthorizedResponse(c)
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID de usuario inválido")
		return
	}

	supermarketID, err := uuid.Parse(req.SupermarketID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID de supermercado inválido")
		return
	}

	cart := models.NewCart(userUUID, supermarketID, true, req.BudgetBs, req.BudgetUsd)

	result, err := h.cartService.CreateCart(c.Request.Context(), cart)
	if err != nil {
		h.handleError(c, err)
		return
	}

	resp := dto.CartResponse{
		ID:               result.ID.String(),
		SupermarketID:    result.SupermarketID.String(),
		UserID:           result.UserID.String(),
		IsActive:         result.IsActive,
		BudgetBs:         result.BudgetBs,
		BudgetUsd:        result.BudgetUsd,
		TotalEstimatedBs: result.TotalEstimatedBs,
		TotalEstimatedUsd: result.TotalEstimatedUsd,
	}
	utils.SuccessResponse(c, resp)
}

func (h *CartHandler) AddProduct(c *gin.Context) {
	var req dto.AddProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationError(c, dto.ValidateRequest(req))
		return
	}

	cartID, err := uuid.Parse(req.CartID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID de carrito inválido")
		return
	}

	productID, err := uuid.Parse(req.ProductID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID de producto inválido")
		return
	}

	cartProduct := models.NewCartProduct(cartID, productID, req.Quantity, req.IsManualEntry)

	result, err := h.cartService.AddProduct(c.Request.Context(), cartProduct)
	if err != nil {
		h.handleError(c, err)
		return
	}

	resp := dto.CartProductResponse{
		ID:            result.ID.String(),
		CartID:        result.CartID.String(),
		ProductID:     result.ProductID.String(),
		Quantity:      result.Quantity,
		IsManualEntry: result.IsManualEntry,
	}
	utils.SuccessResponse(c, resp)
}

func (h *CartHandler) UpdateProductQuantity(c *gin.Context) {
	var req dto.UpdateProductQuantityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationError(c, dto.ValidateRequest(req))
		return
	}

	cartProductID, err := uuid.Parse(req.CartProductID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID de producto en carrito inválido")
		return
	}

	cartID, err := uuid.Parse(req.CartID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID de carrito inválido")
		return
	}

	cartProduct := &models.CartProduct{
		CartID:   cartID,
		Quantity: req.Quantity,
	}
	cartProduct.ID = cartProductID

	result, err := h.cartService.UpdateProductQuantity(c.Request.Context(), cartProduct)
	if err != nil {
		h.handleError(c, err)
		return
	}

	resp := dto.CartProductResponse{
		ID:            result.ID.String(),
		CartID:        result.CartID.String(),
		ProductID:     result.ProductID.String(),
		Quantity:      result.Quantity,
		IsManualEntry: result.IsManualEntry,
	}
	utils.SuccessResponse(c, resp)
}

func (h *CartHandler) RemoveItem(c *gin.Context) {
	cartItemID, err := utils.ParseUUID(c.Param("cartItemId"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID de producto en carrito inválido")
		return
	}

	if err := h.cartService.RemoveProduct(c.Request.Context(), cartItemID); err != nil {
		h.handleError(c, err)
		return
	}

	utils.SuccessResponse(c, nil)
}

func (h *CartHandler) GetCartItems(c *gin.Context) {
	cartID, err := utils.ParseUUID(c.Param("cartId"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID de carrito inválido")
		return
	}

	items, err := h.cartService.GetCartProducts(c.Request.Context(), cartID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	resp := make([]dto.CartProductResponse, len(items))
	for i, item := range items {
		resp[i] = dto.CartProductResponse{
			ID:            item.ID.String(),
			CartID:        item.CartID.String(),
			ProductID:     item.ProductID.String(),
			Quantity:      item.Quantity,
			IsManualEntry: item.IsManualEntry,
		}
	}
	utils.SuccessResponse(c, resp)
}

func (h *CartHandler) CheckoutCart(c *gin.Context) {
	cartID, err := utils.ParseUUID(c.Param("cartId"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID de carrito inválido")
		return
	}

	cart, err := h.cartService.CheckoutCart(c.Request.Context(), cartID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	resp := dto.CartResponse{
		ID:               cart.ID.String(),
		SupermarketID:    cart.SupermarketID.String(),
		UserID:           cart.UserID.String(),
		IsActive:         cart.IsActive,
		BudgetBs:         cart.BudgetBs,
		BudgetUsd:        cart.BudgetUsd,
		TotalEstimatedBs: cart.TotalEstimatedBs,
		TotalEstimatedUsd: cart.TotalEstimatedUsd,
	}
	utils.SuccessResponse(c, resp)
}

func (h *CartHandler) handleError(c *gin.Context, err error) {
	switch err {
	case apperrors.ErrConflict:
		utils.ErrorResponse(c, http.StatusConflict, "conflicto en el carrito")
	case apperrors.ErrNotFound:
		utils.NotFoundResponse(c, "recurso")
	default:
		utils.InternalErrorResponse(c)
	}
}