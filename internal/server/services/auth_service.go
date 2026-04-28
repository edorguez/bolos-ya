package services

import (
	"context"

	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/repository"
)

// AuthService defines user management operations.
// Authentication (password hashing, token generation, session management)
// is delegated to better-auth via the Expo API Routes.
type AuthService interface {
	GetOrCreateUser(ctx context.Context, betterAuthUserID, email, authProvider string) (*models.User, error)
	GetUserByID(ctx context.Context, betterAuthUserID string) (*models.User, error)
}

type authService struct {
	userRepo       repository.UserRepository
	internalAPIKey string
}

func NewAuthService(userRepo repository.UserRepository, internalAPIKey string) AuthService {
	return &authService{
		userRepo:       userRepo,
		internalAPIKey: internalAPIKey,
	}
}

type SyncUserRequest struct {
	BetterAuthUserID string `json:"betterAuthUserId" binding:"required"`
	Email            string `json:"email" binding:"required,email"`
	AuthProvider     string `json:"authProvider" binding:"required"`
	IsPremium        bool   `json:"isPremium"`
	PremiumUntil     string `json:"premiumUntil"`
}

func (s *authService) GetOrCreateUser(ctx context.Context, betterAuthUserID, email, authProvider string) (*models.User, error) {
	user, err := s.userRepo.FindByBetterAuthUserID(ctx, betterAuthUserID)
	if err != nil {
		if err != apperrors.ErrNotFound {
			return nil, err
		}

		user = models.NewUserFromBetterAuth(betterAuthUserID, email, authProvider)
		if err := s.userRepo.Create(ctx, user); err != nil {
			return nil, err
		}

		return user, nil
	}

	if user.Email != email {
		user.Email = email
	}
	if authProvider != "" {
		user.AuthProvider = authProvider
	}
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *authService) GetUserByID(ctx context.Context, betterAuthUserID string) (*models.User, error) {
	return s.userRepo.FindByBetterAuthUserID(ctx, betterAuthUserID)
}

func (s *authService) ValidateAPIKey(apiKey string) bool {
	return apiKey == s.internalAPIKey
}
