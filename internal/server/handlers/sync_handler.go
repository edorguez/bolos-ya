package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"

	"github.com/edorguez/bolos-ya/internal/server/services"
	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"
	"github.com/edorguez/bolos-ya/pkg/utils"
)

// SyncHandler handles offline synchronization HTTP requests
type SyncHandler struct {
	syncService services.SyncService
}

// NewSyncHandler creates a new SyncHandler
func NewSyncHandler(syncService services.SyncService) *SyncHandler {
	return &SyncHandler{
		syncService: syncService,
	}
}

// ProcessSync handles batch sync operations
func (h *SyncHandler) ProcessSync(c *gin.Context) {
	userID, err := utils.ParseUUID(c.Param("userId"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	var req services.SyncRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.handleValidationError(c, err)
		return
	}

	resp, err := h.syncService.ProcessSync(c.Request.Context(), userID, req)
	if err != nil {
		h.handleError(c, err)
		return
	}

	utils.SuccessResponse(c, resp)
}

// MarkUserSynced updates user's last sync timestamp
func (h *SyncHandler) MarkUserSynced(c *gin.Context) {
	userID, err := utils.ParseUUID(c.Param("userId"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid user ID")
		return
	}

	if err := h.syncService.MarkUserSynced(c.Request.Context(), userID); err != nil {
		h.handleError(c, err)
		return
	}

	utils.SuccessResponse(c, nil)
}

// handleValidationError converts validation errors to proper HTTP response
func (h *SyncHandler) handleValidationError(c *gin.Context, err error) {
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
func (h *SyncHandler) handleError(c *gin.Context, err error) {
	switch err {
	case apperrors.ErrNotFound:
		utils.NotFoundResponse(c, "user")
	default:
		utils.InternalErrorResponse(c)
	}
}
