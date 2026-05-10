package services

import (
	"context"

	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"
	"github.com/edorguez/bolos-ya/pkg/constants"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/repository"
)

// AuthService defines user management operations.
// Authentication (password hashing, token generation, session management)
// is delegated to better-auth via the Expo API Routes.
type AuthService interface {
	GetOrCreateUser(ctx context.Context, betterAuthUserID, email, authProvider string, isAnonymous bool) (*models.User, error)
	GetOrCreateUserFromHeaders(ctx context.Context, userID, userEmail, authProvider string, isAnonymous bool) (*models.User, error)
	GetUserByID(ctx context.Context, betterAuthUserID string) (*models.User, error)
}

type authService struct {
	userRepo repository.UserRepository
}

func NewAuthService(userRepo repository.UserRepository) AuthService {
	return &authService{
		userRepo: userRepo,
	}
}

func (s *authService) GetOrCreateUser(ctx context.Context, betterAuthUserID, email, authProvider string, isAnonymous bool) (*models.User, error) {
	user, err := s.userRepo.FindByBetterAuthUserID(ctx, betterAuthUserID)
	if err != nil {
		if err != apperrors.ErrNotFound {
			return nil, err
		}

		user = models.NewUserFromBetterAuth(betterAuthUserID, email, authProvider, isAnonymous)
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

func (s *authService) GetOrCreateUserFromHeaders(ctx context.Context, userID, userEmail, authProvider string, isAnonymous bool) (*models.User, error) {
	user, err := s.userRepo.FindByBetterAuthUserID(ctx, userID)
	if err != nil {
		if err != apperrors.ErrNotFound {
			return nil, err
		}

		if userEmail == "" {
			userEmail = userID + "@anonymous.local"
		}

		provider := authProvider
		if provider == "" {
			provider = constants.AuthProviderEmail
		}

		user = models.NewUserFromBetterAuth(userID, userEmail, provider, isAnonymous)
		if err := s.userRepo.Create(ctx, user); err != nil {
			return nil, err
		}

		return user, nil
	}

	if userEmail != "" && user.Email != userEmail {
		user.Email = userEmail
	}
	if authProvider != "" {
		user.AuthProvider = authProvider
	}
	if user.IsAnonymous != isAnonymous {
		user.IsAnonymous = isAnonymous
	}
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}
