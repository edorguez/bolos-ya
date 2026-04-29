package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/edorguez/bolos-ya/internal/server/dto"
	"github.com/edorguez/bolos-ya/internal/server/middleware"
	"github.com/edorguez/bolos-ya/internal/server/services"
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
	var req dto.SyncUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationError(c, dto.ValidateRequest(req))
		return
	}

	user, err := h.authService.GetOrCreateUser(
		c.Request.Context(),
		req.BetterAuthUserID,
		req.Email,
		req.AuthProvider,
	)
	if err != nil {
		h.handleError(c, err)
		return
	}

	resp := dto.SyncUserResponse{
		ID:               user.ID.String(),
		BetterAuthUserID: user.BetterAuthUserID,
		Email:            user.Email,
		AuthProvider:     user.AuthProvider,
		IsPremium:        user.IsPremium,
	}
	utils.SuccessResponse(c, resp)
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		utils.UnauthorizedResponse(c)
		return
	}

	utils.SuccessResponse(c, dto.GetMeResponse{UserID: userID})
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