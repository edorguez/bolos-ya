package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"go.uber.org/zap"

	"github.com/edorguez/bolos-ya/pkg/constants"
	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"

	"github.com/edorguez/bolos-ya/internal/server/email"
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
	emailSvc email.Service
	log      *zap.Logger
}

func NewAuthService(userRepo repository.UserRepository, emailSvc email.Service, log *zap.Logger) AuthService {
	return &authService{
		userRepo: userRepo,
		emailSvc: emailSvc,
		log:      log,
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

		s.sendWelcomeEmail(user)
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

func (s *authService) sendWelcomeEmail(user *models.User) {
	if user.IsAnonymous || user.AuthProvider == constants.AuthProviderGuest {
		return
	}

	if strings.HasSuffix(user.Email, "@anonymous.local") {
		return
	}

	userName := strings.Split(user.Email, "@")[0]

	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := s.emailSvc.SendWelcome(ctx, user.Email, userName); err != nil {
			s.log.Error("failed to send welcome email", zap.Error(err), zap.String("email", user.Email))
		}
	}()
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

		s.sendWelcomeEmail(user)
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
