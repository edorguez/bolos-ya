package handlers

import (
	"github.com/gin-gonic/gin"

	"github.com/edorguez/bolos-ya/internal/server/dto"
	"github.com/edorguez/bolos-ya/internal/server/services"
	"github.com/edorguez/bolos-ya/pkg/utils"
)

type PaymentStatusHandler struct {
	service services.PaymentStatusService
}

func NewPaymentStatusHandler(service services.PaymentStatusService) *PaymentStatusHandler {
	return &PaymentStatusHandler{service: service}
}

func (h *PaymentStatusHandler) GetAll(c *gin.Context) {
	statuses, err := h.service.FindAll(c.Request.Context())
	if err != nil {
		utils.InternalErrorResponse(c)
		return
	}
	resp := make([]dto.PaymentStatusResponse, len(statuses))
	for i, s := range statuses {
		resp[i] = dto.PaymentStatusResponse{
			ID:          s.ID.String(),
			Name:        s.Name,
			Description: s.Description,
		}
	}
	utils.SuccessResponse(c, resp)
}
