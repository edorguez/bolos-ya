package services

import (
	"context"

	"github.com/google/uuid"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/repository"
)

type PaymentService interface {
	CreatePayment(ctx context.Context, payment *models.Payment) (*models.Payment, error)
	FindByID(ctx context.Context, id uuid.UUID) (*models.Payment, error)
	FindAll(ctx context.Context) ([]*models.Payment, error)
	FindByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Payment, error)
	FindByEmail(ctx context.Context, email string) ([]*models.Payment, error)
	FindPendingByUserID(ctx context.Context, userID uuid.UUID) (*models.Payment, error)
	UpdatePayment(ctx context.Context, paymentID uuid.UUID, isConfirmed bool) (*models.Payment, error)
	DeletePayment(ctx context.Context, id uuid.UUID) error
}

type paymentService struct {
	paymentRepo repository.PaymentRepository
}

func NewPaymentService(paymentRepo repository.PaymentRepository) PaymentService {
	return &paymentService{paymentRepo: paymentRepo}
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

func (s *paymentService) FindPendingByUserID(ctx context.Context, userID uuid.UUID) (*models.Payment, error) {
	return s.paymentRepo.FindPendingByUserID(ctx, userID)
}

func (s *paymentService) UpdatePayment(ctx context.Context, paymentID uuid.UUID, isConfirmed bool) (*models.Payment, error) {
	payment, err := s.paymentRepo.FindByID(ctx, paymentID)
	if err != nil {
		return nil, err
	}

	payment.IsConfirmed = isConfirmed

	if err := s.paymentRepo.Update(ctx, payment); err != nil {
		return nil, err
	}

	return payment, nil
}

func (s *paymentService) DeletePayment(ctx context.Context, id uuid.UUID) error {
	return s.paymentRepo.Delete(ctx, id)
}
