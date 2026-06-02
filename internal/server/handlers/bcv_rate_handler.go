package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/edorguez/bolos-ya/internal/server/dto"
	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/services"
	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"
	"github.com/edorguez/bolos-ya/pkg/utils"
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
		if err == apperrors.ErrNotFound {
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
		RateDate:  rate.RateDate,
		UsdRate:   rate.UsdRate,
		EurRate:   rate.EurRate,
		CreatedAt: rate.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: rate.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
