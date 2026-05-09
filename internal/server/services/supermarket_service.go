package services

import (
	"context"

	"github.com/google/uuid"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/repository"
)

type SupermarketService interface {
	Create(ctx context.Context, supermarket *models.Supermarket) (*models.Supermarket, error)
	FindByID(ctx context.Context, id uuid.UUID) (*models.Supermarket, error)
	FindAll(ctx context.Context, userID uuid.UUID) ([]*models.Supermarket, error)
}

type supermarketService struct {
	supermarketRepo repository.SupermarketRepository
}

func NewSupermarketService(supermarketRepo repository.SupermarketRepository) SupermarketService {
	return &supermarketService{supermarketRepo: supermarketRepo}
}

func (s *supermarketService) Create(ctx context.Context, supermarket *models.Supermarket) (*models.Supermarket, error) {
	if err := s.supermarketRepo.Create(ctx, supermarket); err != nil {
		return nil, err
	}
	return supermarket, nil
}

func (s *supermarketService) FindByID(ctx context.Context, id uuid.UUID) (*models.Supermarket, error) {
	return s.supermarketRepo.FindByID(ctx, id)
}

func (s *supermarketService) FindAll(ctx context.Context, userID uuid.UUID) ([]*models.Supermarket, error) {
	return s.supermarketRepo.FindAll(ctx, userID)
}
