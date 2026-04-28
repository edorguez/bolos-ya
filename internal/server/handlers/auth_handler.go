package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"

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
	var req services.SyncUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleValidationError(c, err)
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

	utils.SuccessResponse(c, gin.H{
		"user": user,
	})
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, _ := c.Get("userID")
	utils.SuccessResponse(c, gin.H{
		"userId": userID,
	})
}

func (h *AuthHandler) handleValidationError(c *gin.Context, err error) {
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

func (h *AuthHandler) handleError(c *gin.Context, err error) {
	switch err {
	case apperrors.ErrConflict:
		utils.ErrorResponse(c, http.StatusConflict, "user already exists")
	case apperrors.ErrUnauthorized:
		utils.UnauthorizedResponse(c)
	case apperrors.ErrNotFound:
		utils.NotFoundResponse(c, "user")
	default:
		utils.InternalErrorResponse(c)
	}
}
