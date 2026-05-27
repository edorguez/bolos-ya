package services

import (
	"context"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/repository"
)

type PaymentStatusService interface {
	FindAll(ctx context.Context) ([]*models.PaymentStatus, error)
}

type paymentStatusService struct {
	repo repository.PaymentStatusRepository
}

func NewPaymentStatusService(repo repository.PaymentStatusRepository) PaymentStatusService {
	return &paymentStatusService{repo: repo}
}

func (s *paymentStatusService) FindAll(ctx context.Context) ([]*models.PaymentStatus, error) {
	return s.repo.FindAll(ctx)
}
