package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/edorguez/bolos-ya/internal/server/dto"
	"github.com/edorguez/bolos-ya/internal/server/middleware"
	"github.com/edorguez/bolos-ya/internal/server/services"
	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"
	"github.com/edorguez/bolos-ya/pkg/utils"
)

type SyncHandler struct {
	syncService services.SyncService
}

func NewSyncHandler(syncService services.SyncService) *SyncHandler {
	return &SyncHandler{
		syncService: syncService,
	}
}

func (h *SyncHandler) ProcessSync(c *gin.Context) {
	var req dto.SyncRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationError(c, dto.ValidateRequest(req))
		return
	}

	userIDStr, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		utils.UnauthorizedResponse(c)
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID de usuario inválido")
		return
	}

	resp, err := h.syncService.ProcessSync(c.Request.Context(), userID, req.Operations)
	if err != nil {
		h.handleError(c, err)
		return
	}

	utils.SuccessResponse(c, resp)
}

func (h *SyncHandler) handleError(c *gin.Context, err error) {
	switch err {
	case apperrors.ErrNotFound:
		utils.NotFoundResponse(c, "usuario")
	default:
		utils.InternalErrorResponse(c)
	}
}