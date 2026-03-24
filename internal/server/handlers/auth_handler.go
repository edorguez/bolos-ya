package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"

	"github.com/edorguez/bolos-ya/internal/server/services"
	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"
	"github.com/edorguez/bolos-ya/pkg/utils"
)

// AuthHandler handles authentication HTTP requests
type AuthHandler struct {
	authService services.AuthService
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(authService services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	var req services.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleValidationError(c, err)
		return
	}

	user, err := h.authService.Register(c.Request.Context(), req)
	if err != nil {
		h.handleError(c, err)
		return
	}

	utils.SuccessResponse(c, gin.H{
		"user": user,
	})
}

// Login handles user login with email/password
func (h *AuthHandler) Login(c *gin.Context) {
	var req services.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleValidationError(c, err)
		return
	}

	loginResp, err := h.authService.Login(c.Request.Context(), req)
	if err != nil {
		h.handleError(c, err)
		return
	}

	utils.SuccessResponse(c, loginResp)
}

// LoginWithGoogle handles Google OAuth login
func (h *AuthHandler) LoginWithGoogle(c *gin.Context) {
	var req services.GoogleLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleValidationError(c, err)
		return
	}

	loginResp, err := h.authService.LoginWithGoogle(c.Request.Context(), req)
	if err != nil {
		h.handleError(c, err)
		return
	}

	utils.SuccessResponse(c, loginResp)
}

// handleValidationError converts validation errors to proper HTTP response
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

// handleError maps service errors to HTTP responses
func (h *AuthHandler) handleError(c *gin.Context, err error) {
	switch err {
	case apperrors.ErrConflict:
		utils.ErrorResponse(c, http.StatusConflict, "user already exists")
	case apperrors.ErrUnauthorized:
		utils.UnauthorizedResponse(c)
	case apperrors.ErrNotFound:
		utils.NotFoundResponse(c, "user")
	case apperrors.ErrNotImplemented:
		utils.ErrorResponse(c, http.StatusNotImplemented, "feature not implemented")
	default:
		utils.InternalErrorResponse(c)
	}
}
