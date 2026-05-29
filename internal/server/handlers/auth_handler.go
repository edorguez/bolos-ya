package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/edorguez/bolos-ya/internal/server/dto"
	"github.com/edorguez/bolos-ya/internal/server/middleware"
	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/services"
	"github.com/edorguez/bolos-ya/pkg/constants"
	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"
	"github.com/edorguez/bolos-ya/pkg/utils"
)

type AuthHandler struct {
	authService services.AuthService
}

func NewAuthHandler(authService services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

func (h *AuthHandler) SyncUser(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		utils.UnauthorizedResponse(c)
		return
	}

	var req dto.SyncUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationError(c, dto.ValidateRequest(req))
		return
	}

	user, err := h.authService.GetOrCreateUser(
		c.Request.Context(),
		userID,
		req.Email,
		req.AuthProvider,
		req.IsAnonymous,
	)
	if err != nil {
		h.handleError(c, err)
		return
	}

	var premiumUntil string
	if user.PremiumUntil != nil {
		premiumUntil = user.PremiumUntil.Format(time.RFC3339)
	}

	resp := dto.SyncUserResponse{
		ID:               user.ID.String(),
		BetterAuthUserID: user.BetterAuthUserID,
		Email:            user.Email,
		AuthProvider:     user.AuthProvider,
		IsPremium:        user.IsPremium,
		IsAnonymous:      user.IsAnonymous,
		PremiumUntil:     premiumUntil,
		CreatedAt:        user.CreatedAt.Format(time.RFC3339),
		UpdatedAt:        user.UpdatedAt.Format(time.RFC3339),
	}
	utils.SuccessResponse(c, resp)
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		utils.UnauthorizedResponse(c)
		return
	}

	userAny, exists := c.Get(constants.CtxUserKey)
	if !exists {
		utils.SuccessResponse(c, dto.GetMeResponse{UserID: userID})
		return
	}

	user, ok := userAny.(*models.User)
	if !ok {
		utils.SuccessResponse(c, dto.GetMeResponse{UserID: userID})
		return
	}

	var premiumUntil *string
	if user.PremiumUntil != nil {
		formatted := user.PremiumUntil.Format(time.RFC3339)
		premiumUntil = &formatted
	}

	utils.SuccessResponse(c, dto.GetMeResponse{
		UserID:       userID,
		IsPremium:    user.IsPremium,
		IsAnonymous:  user.IsAnonymous,
		PremiumUntil: premiumUntil,
	})
}

func (h *AuthHandler) handleError(c *gin.Context, err error) {
	switch err {
	case apperrors.ErrConflict:
		utils.ErrorResponse(c, http.StatusConflict, "el usuario ya existe")
	case apperrors.ErrUnauthorized:
		utils.UnauthorizedResponse(c)
	case apperrors.ErrNotFound:
		utils.NotFoundResponse(c, "usuario")
	default:
		utils.InternalErrorResponse(c)
	}
}