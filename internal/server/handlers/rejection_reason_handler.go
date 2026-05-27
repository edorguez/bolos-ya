package handlers

import (
	"github.com/gin-gonic/gin"

	"github.com/edorguez/bolos-ya/internal/server/dto"
	"github.com/edorguez/bolos-ya/internal/server/services"
	"github.com/edorguez/bolos-ya/pkg/utils"
)

type RejectionReasonHandler struct {
	service services.RejectionReasonService
}

func NewRejectionReasonHandler(service services.RejectionReasonService) *RejectionReasonHandler {
	return &RejectionReasonHandler{service: service}
}

func (h *RejectionReasonHandler) GetAll(c *gin.Context) {
	reasons, err := h.service.FindAll(c.Request.Context())
	if err != nil {
		utils.InternalErrorResponse(c)
		return
	}
	resp := make([]dto.RejectionReasonResponse, len(reasons))
	for i, r := range reasons {
		resp[i] = dto.RejectionReasonResponse{
			ID:     r.ID.String(),
			Reason: r.Reason,
		}
	}
	utils.SuccessResponse(c, resp)
}
