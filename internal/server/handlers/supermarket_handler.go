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

type SupermarketHandler struct {
	supermarketService services.SupermarketService
}

func NewSupermarketHandler(supermarketService services.SupermarketService) *SupermarketHandler {
	return &SupermarketHandler{
		supermarketService: supermarketService,
	}
}

func (h *SupermarketHandler) CreateSupermarket(c *gin.Context) {
	var req dto.CreateSupermarketRequest
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

	supermarket := models.NewSupermarket(req.Name, true, req.ImageUrl, userUUID)

	result, err := h.supermarketService.Create(c.Request.Context(), supermarket)
	if err != nil {
		h.handleError(c, err)
		return
	}

	utils.SuccessResponse(c, toSupermarketResponse(result))
}

func (h *SupermarketHandler) GetSupermarketByID(c *gin.Context) {
	supermarketID, err := utils.ParseUUID(c.Param("supermarketId"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID de supermercado inválido")
		return
	}

	supermarket, err := h.supermarketService.FindByID(c.Request.Context(), supermarketID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	utils.SuccessResponse(c, toSupermarketResponse(supermarket))
}

func (h *SupermarketHandler) GetAllSupermarkets(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)

	var userUUID uuid.UUID
	if ok && userID != "" {
		var err error
		userUUID, err = uuid.Parse(userID)
		if err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "ID de usuario inválido")
			return
		}
	}

	supermarkets, err := h.supermarketService.FindAll(c.Request.Context(), userUUID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	resp := make([]dto.SupermarketResponse, len(supermarkets))
	for i, s := range supermarkets {
		resp[i] = toSupermarketResponse(s)
	}

	utils.SuccessResponse(c, resp)
}

func (h *SupermarketHandler) handleError(c *gin.Context, err error) {
	switch err {
	case apperrors.ErrNotFound:
		utils.NotFoundResponse(c, "supermercado")
	default:
		utils.InternalErrorResponse(c)
	}
}

func toSupermarketResponse(s *models.Supermarket) dto.SupermarketResponse {
	var deletedAt *string
	if s.DeletedAt != nil {
		formatted := s.DeletedAt.Format("2006-01-02T15:04:05Z07:00")
		deletedAt = &formatted
	}

	var userID *string
	if s.UserID != uuid.Nil {
		formatted := s.UserID.String()
		userID = &formatted
	}

	return dto.SupermarketResponse{
		ID:        s.ID.String(),
		Name:      s.Name,
		IsCustom:  s.IsCustom,
		ImageUrl:  s.ImageUrl,
		UserID:    userID,
		CreatedAt: s.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: s.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		DeletedAt: deletedAt,
	}
}
