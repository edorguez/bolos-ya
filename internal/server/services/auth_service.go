package services

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"go.uber.org/zap"

	"github.com/edorguez/merki/pkg/constants"
	apperrors "github.com/edorguez/merki/pkg/core/errors"

	"github.com/edorguez/merki/internal/server/email"
	"github.com/edorguez/merki/internal/server/models"
	"github.com/edorguez/merki/internal/server/repository"
)

type AuthService interface {
	GetOrCreateUser(ctx context.Context, betterAuthUserID, email, name, authProvider string, isAnonymous bool) (*models.User, error)
	GetOrCreateUserFromHeaders(ctx context.Context, userID, userEmail, name, authProvider string, isAnonymous bool) (*models.User, error)
	GetUserByID(ctx context.Context, betterAuthUserID string) (*models.User, error)
	UpdateUserPremium(ctx context.Context, betterAuthUserID string, isPremium bool, premiumUntil *time.Time) error
	MigrateUserData(ctx context.Context, fromBetterAuthUserId, toBetterAuthUserId, email, name, authProvider string) error
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

// recoverSoftDeletedUser restores a soft-deleted user matching the better-auth
// ID so its session token keeps working instead of failing with a unique
// constraint conflict. It returns (nil, nil) when no soft-deleted record exists
// and the caller should create a fresh one.
func (s *authService) recoverSoftDeletedUser(ctx context.Context, betterAuthUserID, userEmail, name, authProvider string, isAnonymous bool) (*models.User, error) {
	existing, err := s.userRepo.FindByBetterAuthUserIDUnscoped(ctx, betterAuthUserID)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, nil
		}
		return nil, err
	}

	if !existing.DeletedAt.Valid {
		return existing, nil
	}

	existing.Email = userEmail
	if existing.Email == "" {
		existing.Email = betterAuthUserID + "@anonymous.local"
	}
	if name != "" {
		existing.Name = models.TruncateName(name)
	}
	if authProvider != "" {
		existing.AuthProvider = authProvider
	}
	existing.IsAnonymous = isAnonymous

	if err := s.userRepo.Restore(ctx, existing); err != nil {
		return nil, err
	}

	return existing, nil
}

func (s *authService) GetOrCreateUser(ctx context.Context, betterAuthUserID, email, name, authProvider string, isAnonymous bool) (*models.User, error) {
	user, err := s.userRepo.FindByBetterAuthUserID(ctx, betterAuthUserID)
	if err != nil {
		if !errors.Is(err, apperrors.ErrNotFound) {
			return nil, err
		}

		// A soft-deleted user may exist for this token (e.g. after a guest to
		// registered migration). Recover it instead of creating a duplicate,
		// which would violate the better_auth_user_id unique constraint.
		if recovered, recErr := s.recoverSoftDeletedUser(ctx, betterAuthUserID, email, name, authProvider, isAnonymous); recErr != nil {
			return nil, recErr
		} else if recovered != nil {
			return recovered, nil
		}

		user = models.NewUserFromBetterAuth(betterAuthUserID, email, models.TruncateName(name), authProvider, isAnonymous)
		if err := s.userRepo.Create(ctx, user); err != nil {
			// Race: user was created concurrently (e.g. by MigrateUserData). Retry find.
			if dup, dupErr := s.userRepo.FindByBetterAuthUserID(ctx, betterAuthUserID); dupErr == nil {
				s.log.Warn("race condition: user was created concurrently, returning existing",
					zap.String("betterAuthUserID", betterAuthUserID),
					zap.String("existingID", dup.ID.String()),
				)
				return dup, nil
			}
			return nil, err
		}

		s.sendWelcomeEmail(user)
		return user, nil
	}

	if user.Email != email {
		user.Email = email
	}
	if name != "" && user.Name != name {
		user.Name = models.TruncateName(name)
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

	email := user.Email
	userName := strings.Split(email, "@")[0]

	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := s.emailSvc.SendWelcome(ctx, email, userName); err != nil {
			s.log.Error("failed to send welcome email", zap.Error(err), zap.String("email", email))
		}
	}()
}

func (s *authService) GetOrCreateUserFromHeaders(ctx context.Context, userID, userEmail, name, authProvider string, isAnonymous bool) (*models.User, error) {
	user, err := s.userRepo.FindByBetterAuthUserID(ctx, userID)
	if err != nil {
		if !errors.Is(err, apperrors.ErrNotFound) {
			return nil, err
		}

		// A soft-deleted user may exist for this token (e.g. after a guest to
		// registered migration). Recover it instead of creating a duplicate,
		// which would violate the better_auth_user_id unique constraint.
		if recovered, recErr := s.recoverSoftDeletedUser(ctx, userID, userEmail, name, authProvider, isAnonymous); recErr != nil {
			return nil, recErr
		} else if recovered != nil {
			return recovered, nil
		}

		if userEmail == "" {
			userEmail = userID + "@anonymous.local"
		}

		provider := authProvider
		if provider == "" {
			provider = constants.AuthProviderEmail
		}

		user = models.NewUserFromBetterAuth(userID, userEmail, models.TruncateName(name), provider, isAnonymous)
		if err := s.userRepo.Create(ctx, user); err != nil {
			// Race: user was created concurrently (e.g. by MigrateUserData). Retry find.
			if dup, dupErr := s.userRepo.FindByBetterAuthUserID(ctx, userID); dupErr == nil {
				s.log.Warn("race condition: user was created concurrently, returning existing",
					zap.String("betterAuthUserID", userID),
					zap.String("existingID", dup.ID.String()),
				)
				return dup, nil
			}
			return nil, err
		}

		s.sendWelcomeEmail(user)
		return user, nil
	}

	if userEmail != "" && user.Email != userEmail {
		user.Email = userEmail
	}
	if name != "" && user.Name != name {
		user.Name = models.TruncateName(name)
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

func (s *authService) MigrateUserData(ctx context.Context, fromBetterAuthUserId, toBetterAuthUserId, email, name, authProvider string) error {
	user, err := s.userRepo.FindByBetterAuthUserID(ctx, fromBetterAuthUserId)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			// Idempotent: the source user was already migrated/deleted.
			return nil
		}
		return fmt.Errorf("failed to find source user: %w", err)
	}

	destUser, err := s.userRepo.FindByBetterAuthUserID(ctx, toBetterAuthUserId)
	if err != nil && !errors.Is(err, apperrors.ErrNotFound) {
		return fmt.Errorf("failed to find destination user: %w", err)
	}

	if err == nil {
		if destUser.ID == user.ID {
			return nil
		}
		if err := s.userRepo.TransferUserData(ctx, user.ID, destUser.ID); err != nil {
			return fmt.Errorf("failed to transfer anonymous data: %w", err)
		}
		return s.userRepo.Delete(ctx, user.ID)
	}

	destUser = models.NewUserFromBetterAuth(toBetterAuthUserId, email, models.TruncateName(name), authProvider, false)
	if err := s.userRepo.Create(ctx, destUser); err != nil {
		return fmt.Errorf("failed to create destination user: %w", err)
	}

	if err := s.userRepo.TransferUserData(ctx, user.ID, destUser.ID); err != nil {
		return fmt.Errorf("failed to transfer user data: %w", err)
	}

	return s.userRepo.Delete(ctx, user.ID)
}
