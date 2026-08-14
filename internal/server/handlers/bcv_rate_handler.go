package handlers

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/edorguez/merki/internal/server/dto"
	"github.com/edorguez/merki/internal/server/models"
	"github.com/edorguez/merki/internal/server/services"
	apperrors "github.com/edorguez/merki/pkg/core/errors"
	"github.com/edorguez/merki/pkg/utils"
)

type BCVRateHandler struct {
	bcvRateService services.BCVRateService
}

func NewBCVRateHandler(bcvRateService services.BCVRateService) *BCVRateHandler {
	return &BCVRateHandler{bcvRateService: bcvRateService}
}

func (h *BCVRateHandler) GetLatestRate(c *gin.Context) {
	rate, err := h.bcvRateService.GetLatestRate(c.Request.Context())
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			utils.NotFoundResponse(c, "BCV rate")
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "error al obtener la tasa BCV")
		return
	}
	utils.SuccessResponse(c, toBCVRateResponse(rate))
}

func toBCVRateResponse(rate *models.BCVRate) dto.BCVRateResponse {
	return dto.BCVRateResponse{
		ID:        rate.ID.String(),
		UsdRate:   rate.UsdRate,
		EurRate:   rate.EurRate,
		CreatedAt: rate.CreatedAt.Format(time.RFC3339),
		UpdatedAt: rate.UpdatedAt.Format(time.RFC3339),
	}
}
