package services

import (
	"context"

	"github.com/google/uuid"

	"github.com/edorguez/bolos-ya/internal/server/dto"
	"github.com/edorguez/bolos-ya/internal/server/repository"
)

// SyncService defines offline synchronization operations
type SyncService interface {
	ProcessSync(ctx context.Context, userID uuid.UUID, operations []dto.SyncOperation) (*dto.SyncResponse, error)
}

type syncService struct {
	userRepo        repository.UserRepository
	cartRepo        repository.CartRepository
	cartProductRepo repository.CartProductRepository
	productRepo     repository.ProductRepository
	supermarketRepo repository.SupermarketRepository
}

func NewSyncService(
	userRepo repository.UserRepository,
	cartRepo repository.CartRepository,
	cartProductRepo repository.CartProductRepository,
	productRepo repository.ProductRepository,
	supermarketRepo repository.SupermarketRepository,
) SyncService {
	return &syncService{
		userRepo:        userRepo,
		cartRepo:        cartRepo,
		cartProductRepo: cartProductRepo,
		productRepo:     productRepo,
		supermarketRepo: supermarketRepo,
	}
}

// ProcessSync processes a batch of sync operations from a mobile client
func (s *syncService) ProcessSync(ctx context.Context, userID uuid.UUID, operations []dto.SyncOperation) (*dto.SyncResponse, error) {
	results := make([]dto.SyncResult, len(operations))

	for i, op := range operations {
		result := dto.SyncResult{
			LocalID: op.LocalID,
			Success: false,
		}

		// Process each operation based on table and action
		switch op.Table {
		case dto.SyncTableUsers:
			result.Success, result.Error = s.processUserOperation(ctx, userID, op)
		default:
			result.Error = "tabla desconocida"
		}

		// If operation failed with conflict, include server version
		if result.Error == "conflict" {
			result.ServerVersion = map[string]any{}
		}

		results[i] = result
	}

	return &dto.SyncResponse{Results: results}, nil
}

// processUserOperation processes sync operations for users table
func (s *syncService) processUserOperation(ctx context.Context, userID uuid.UUID, op dto.SyncOperation) (bool, string) {
	// Users can only modify their own data
	opUserID, ok := op.Payload["id"].(string)
	if !ok {
		return false, "ID de usuario inválido"
	}

	parsedUserID, err := uuid.Parse(opUserID)
	if err != nil {
		return false, "formato de ID de usuario inválido"
	}

	// Ensure user can only modify their own data
	if parsedUserID != userID {
		return false, "no autorizado"
	}

	switch op.Action {
	case dto.SyncOpInsert:
		return false, "registro de usuario no permitido via sync"
	case dto.SyncOpUpdate:
		user, err := s.userRepo.FindByID(ctx, parsedUserID)
		if err != nil {
			return false, err.Error()
		}

		if email, ok := op.Payload["email"].(string); ok {
			user.Email = email
		}
		if isPremium, ok := op.Payload["isPremium"].(bool); ok {
			user.IsPremium = isPremium
		}

		if err := s.userRepo.Update(ctx, user); err != nil {
			return false, err.Error()
		}
		return true, ""
	case dto.SyncOpDelete:
		if err := s.userRepo.Delete(ctx, parsedUserID); err != nil {
			return false, err.Error()
		}
		return true, ""
	default:
		return false, "acción desconocida"
	}
}
