package services

import (
	"context"
	"time"

	"github.com/google/uuid"

	"github.com/edorguez/bolos-ya/internal/server/dto"
	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/repository"
)

type PaymentService interface {
	CreatePayment(ctx context.Context, payment *models.Payment) (*models.Payment, error)
	FindByID(ctx context.Context, id uuid.UUID) (*models.Payment, error)
	FindAll(ctx context.Context) ([]*models.Payment, error)
	FindByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Payment, error)
	FindByUserIDAndStatus(ctx context.Context, userID uuid.UUID, statusID uuid.UUID) ([]*models.Payment, error)
	FindByEmail(ctx context.Context, email string) ([]*models.Payment, error)
	UpdatePayment(ctx context.Context, paymentID uuid.UUID, req dto.UpdatePaymentRequest) (*models.Payment, error)
	DeletePayment(ctx context.Context, id uuid.UUID) error
}

type paymentService struct {
	paymentRepo       repository.PaymentRepository
	paymentStatusRepo repository.PaymentStatusRepository
}

func NewPaymentService(paymentRepo repository.PaymentRepository, paymentStatusRepo repository.PaymentStatusRepository) PaymentService {
	return &paymentService{paymentRepo: paymentRepo, paymentStatusRepo: paymentStatusRepo}
}

func (s *paymentService) CreatePayment(ctx context.Context, payment *models.Payment) (*models.Payment, error) {
	if err := s.paymentRepo.Create(ctx, payment); err != nil {
		return nil, err
	}
	return payment, nil
}

func (s *paymentService) FindByID(ctx context.Context, id uuid.UUID) (*models.Payment, error) {
	return s.paymentRepo.FindByID(ctx, id)
}

func (s *paymentService) FindAll(ctx context.Context) ([]*models.Payment, error) {
	return s.paymentRepo.FindAll(ctx)
}

func (s *paymentService) FindByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Payment, error) {
	return s.paymentRepo.FindByUserID(ctx, userID)
}

func (s *paymentService) FindByEmail(ctx context.Context, email string) ([]*models.Payment, error) {
	return s.paymentRepo.FindByEmail(ctx, email)
}

func (s *paymentService) FindByUserIDAndStatus(ctx context.Context, userID uuid.UUID, statusID uuid.UUID) ([]*models.Payment, error) {
	return s.paymentRepo.FindByUserIDAndStatus(ctx, userID, statusID)
}

func (s *paymentService) UpdatePayment(ctx context.Context, paymentID uuid.UUID, req dto.UpdatePaymentRequest) (*models.Payment, error) {
	payment, err := s.paymentRepo.FindByID(ctx, paymentID)
	if err != nil {
		return nil, err
	}

	statusID, err := uuid.Parse(req.StatusID)
	if err != nil {
		return nil, err
	}

	paymentStatus, err := s.paymentStatusRepo.FindByID(ctx, statusID)
	if err != nil {
		return nil, err
	}

	now := time.Now()

	switch statusID.String() {
	case models.ApprovedStatusID:
		payment.ApprovedAt = &now
		payment.RejectedAt = nil
		payment.RejectionReasonID = nil
		payment.RejectionMessage = nil

	case models.RejectedStatusID:
		payment.RejectedAt = &now
		payment.ApprovedAt = nil
		if req.RejectionReasonID != nil {
			reasonID, err := uuid.Parse(*req.RejectionReasonID)
			if err != nil {
				return nil, err
			}
			payment.RejectionReasonID = &reasonID
		}
		payment.RejectionMessage = req.RejectionMessage

	default:
		payment.ApprovedAt = nil
		payment.RejectedAt = nil
		payment.RejectionReasonID = nil
		payment.RejectionMessage = nil
	}

	payment.StatusID = statusID
	payment.PaymentStatus = *paymentStatus

	if err := s.paymentRepo.Update(ctx, payment); err != nil {
		return nil, err
	}
	return payment, nil
}

func (s *paymentService) DeletePayment(ctx context.Context, id uuid.UUID) error {
	return s.paymentRepo.Delete(ctx, id)
}
