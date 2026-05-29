package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"go.uber.org/zap"

	"github.com/edorguez/bolos-ya/pkg/constants"
	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"

	"github.com/edorguez/bolos-ya/internal/server/email"
	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/repository"
)

type AuthService interface {
	GetOrCreateUser(ctx context.Context, betterAuthUserID, email, authProvider string, isAnonymous bool) (*models.User, error)
	GetOrCreateUserFromHeaders(ctx context.Context, userID, userEmail, authProvider string, isAnonymous bool) (*models.User, error)
	GetUserByID(ctx context.Context, betterAuthUserID string) (*models.User, error)
	UpdateUserPremium(ctx context.Context, betterAuthUserID string, isPremium bool, premiumUntil *time.Time) error
}

type authService struct {
	userRepo      repository.UserRepository
	emailSvc      email.Service
	log           *zap.Logger
	betterAuthURL string
}

func NewAuthService(userRepo repository.UserRepository, emailSvc email.Service, log *zap.Logger, betterAuthURL string) AuthService {
	return &authService{
		userRepo:      userRepo,
		emailSvc:      emailSvc,
		log:           log,
		betterAuthURL: betterAuthURL,
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

func (s *authService) UpdateUserPremium(ctx context.Context, betterAuthUserID string, isPremium bool, premiumUntil *time.Time) error {
	body := map[string]any{
		"userId":    betterAuthUserID,
		"isPremium": isPremium,
	}

	if premiumUntil != nil {
		body["premiumUntil"] = premiumUntil.Format(time.RFC3339)
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("failed to marshal premium update request: %w", err)
	}

	url := s.betterAuthURL + "/api/auth/update-premium"
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to create premium update request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to call auth server for premium update: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("auth server returned status %d for premium update", resp.StatusCode)
	}

	return nil
}
