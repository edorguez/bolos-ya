package services

import (
	"context"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/repository"
)

type RejectionReasonService interface {
	FindAll(ctx context.Context) ([]*models.RejectionReason, error)
}

type rejectionReasonService struct {
	repo repository.RejectionReasonRepository
}

func NewRejectionReasonService(repo repository.RejectionReasonRepository) RejectionReasonService {
	return &rejectionReasonService{repo: repo}
}

func (s *rejectionReasonService) FindAll(ctx context.Context) ([]*models.RejectionReason, error) {
	return s.repo.FindAll(ctx)
}
