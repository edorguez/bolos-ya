package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/edorguez/bolos-ya/internal/server/dto"
	"github.com/edorguez/bolos-ya/internal/server/middleware"
	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/services"
	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"
	"github.com/edorguez/bolos-ya/pkg/utils"
)

type PaymentHandler struct {
	paymentService services.PaymentService
}

func NewPaymentHandler(paymentService services.PaymentService) *PaymentHandler {
	return &PaymentHandler{paymentService: paymentService}
}

func (h *PaymentHandler) CreatePayment(c *gin.Context) {
	var req dto.CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationError(c, dto.ValidateRequest(req))
		return
	}
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		utils.UnauthorizedResponse(c)
		return
	}
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID de usuario inv\u00e1lido")
		return
	}
	paidAt, err := time.Parse(time.RFC3339, req.PaidAt)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "paidAt debe tener formato ISO 8601 (RFC3339)")
		return
	}
	payment := models.NewPayment(
		userUUID, req.NumberOfMonths, req.ReferenceNumber, req.BankName,
		req.AmountBs, req.AmountUsd, req.PriceBcv, req.Identification,
		req.IsDiscount, paidAt,
	)
	result, err := h.paymentService.CreatePayment(c.Request.Context(), payment)
	if err != nil {
		h.handleError(c, err)
		return
	}
	utils.SuccessResponse(c, toPaymentResponse(result))
}

func (h *PaymentHandler) GetPaymentByID(c *gin.Context) {
	paymentID, err := utils.ParseUUID(c.Param("paymentId"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID de pago inv\u00e1lido")
		return
	}
	payment, err := h.paymentService.FindByID(c.Request.Context(), paymentID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	utils.SuccessResponse(c, toPaymentResponse(payment))
}

func (h *PaymentHandler) GetAllPayments(c *gin.Context) {
	payments, err := h.paymentService.FindAll(c.Request.Context())
	if err != nil {
		h.handleError(c, err)
		return
	}
	resp := make([]dto.PaymentResponse, len(payments))
	for i, p := range payments {
		resp[i] = toPaymentResponse(p)
	}
	utils.SuccessResponse(c, resp)
}

func (h *PaymentHandler) GetPaymentsByUserID(c *gin.Context) {
	userID, err := utils.ParseUUID(c.Param("userId"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID de usuario inv\u00e1lido")
		return
	}

	statusIDStr := c.Query("statusId")
	if statusIDStr != "" {
		statusUUID, err := uuid.Parse(statusIDStr)
		if err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "statusId inv\u00e1lido")
			return
		}
		payments, err := h.paymentService.FindByUserIDAndStatus(c.Request.Context(), userID, statusUUID)
		if err != nil {
			h.handleError(c, err)
			return
		}
		resp := make([]dto.PaymentResponse, len(payments))
		for i, p := range payments {
			resp[i] = toPaymentResponse(p)
		}
		utils.SuccessResponse(c, resp)
		return
	}

	payments, err := h.paymentService.FindByUserID(c.Request.Context(), userID)
	if err != nil {
		h.handleError(c, err)
		return
	}
	resp := make([]dto.PaymentResponse, len(payments))
	for i, p := range payments {
		resp[i] = toPaymentResponse(p)
	}
	utils.SuccessResponse(c, resp)
}

func (h *PaymentHandler) GetPaymentsByEmail(c *gin.Context) {
	email := c.Param("email")
	if email == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "email es requerido")
		return
	}
	payments, err := h.paymentService.FindByEmail(c.Request.Context(), email)
	if err != nil {
		h.handleError(c, err)
		return
	}
	resp := make([]dto.PaymentResponse, len(payments))
	for i, p := range payments {
		resp[i] = toPaymentResponse(p)
	}
	utils.SuccessResponse(c, resp)
}

func (h *PaymentHandler) UpdatePayment(c *gin.Context) {
	paymentID, err := utils.ParseUUID(c.Param("paymentId"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID de pago inv\u00e1lido")
		return
	}
	var req dto.UpdatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationError(c, dto.ValidateRequest(req))
		return
	}
	result, err := h.paymentService.UpdatePayment(c.Request.Context(), paymentID, req)
	if err != nil {
		h.handleError(c, err)
		return
	}
	utils.SuccessResponse(c, toPaymentResponse(result))
}

func (h *PaymentHandler) DeletePayment(c *gin.Context) {
	paymentID, err := utils.ParseUUID(c.Param("paymentId"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID de pago inv\u00e1lido")
		return
	}
	if err := h.paymentService.DeletePayment(c.Request.Context(), paymentID); err != nil {
		h.handleError(c, err)
		return
	}
	utils.SuccessResponse(c, nil)
}

func (h *PaymentHandler) handleError(c *gin.Context, err error) {
	switch err {
	case apperrors.ErrNotFound:
		utils.NotFoundResponse(c, "pago")
	default:
		utils.InternalErrorResponse(c)
	}
}

func toPaymentResponse(p *models.Payment) dto.PaymentResponse {
	var deletedAt *string
	if p.DeletedAt.Valid {
		formatted := p.DeletedAt.Time.Format(time.RFC3339)
		deletedAt = &formatted
	}
	var premiumUntil *string
	if p.User.PremiumUntil != nil {
		formatted := p.User.PremiumUntil.Format(time.RFC3339)
		premiumUntil = &formatted
	}
	var approvedAt *string
	if p.ApprovedAt != nil {
		formatted := p.ApprovedAt.Format(time.RFC3339)
		approvedAt = &formatted
	}
	var rejectedAt *string
	if p.RejectedAt != nil {
		formatted := p.RejectedAt.Format(time.RFC3339)
		rejectedAt = &formatted
	}
	var rejectionReasonID *string
	if p.RejectionReasonID != nil {
		formatted := p.RejectionReasonID.String()
		rejectionReasonID = &formatted
	}

	paymentStatus := &dto.PaymentStatusResponse{
		ID:          p.PaymentStatus.ID.String(),
		Name:        p.PaymentStatus.Name,
		Description: p.PaymentStatus.Description,
	}

	var rejectionReason *dto.RejectionReasonResponse
	if p.RejectionReason != nil {
		rejectionReason = &dto.RejectionReasonResponse{
			ID:     p.RejectionReason.ID.String(),
			Reason: p.RejectionReason.Reason,
		}
	}

	return dto.PaymentResponse{
		ID:              p.ID.String(),
		UserID:          p.UserID.String(),
		NumberOfMonths:  p.NumberOfMonths,
		ReferenceNumber: p.ReferenceNumber,
		BankName:        p.BankName,
		AmountBs:        p.AmountBs,
		AmountUsd:       p.AmountUsd,
		PriceBcv:        p.PriceBcv,
		Identification:  p.Identification,
		IsDiscount:      p.IsDiscount,
		PaidAt:          p.PaidAt.Format(time.RFC3339),
		StatusID:        p.StatusID.String(),
		RejectionReasonID: rejectionReasonID,
		RejectionMessage:  p.RejectionMessage,
		ApprovedAt:        approvedAt,
		RejectedAt:        rejectedAt,
		CreatedAt:       p.CreatedAt.Format(time.RFC3339),
		UpdatedAt:       p.UpdatedAt.Format(time.RFC3339),
		DeletedAt:       deletedAt,
		User: dto.PaymentUserResponse{
			ID:            p.User.ID.String(),
			Email:         p.User.Email,
			AuthProvider:  p.User.AuthProvider,
			IsPremium:     p.User.IsPremium,
			IsAnonymous:   p.User.IsAnonymous,
			PremiumUntil:  premiumUntil,
		},
		PaymentStatus:   paymentStatus,
		RejectionReason: rejectionReason,
	}
}
