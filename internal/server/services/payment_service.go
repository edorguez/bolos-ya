package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"

	"github.com/edorguez/bolos-ya/internal/server/dto"
	"github.com/edorguez/bolos-ya/internal/server/email"
	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/repository"
)

type PaymentService interface {
	CreatePayment(ctx context.Context, payment *models.Payment) (*models.Payment, error)
	FindByID(ctx context.Context, id uuid.UUID) (*models.Payment, error)
	FindAll(ctx context.Context) ([]*models.Payment, error)
	FindAllPaginated(ctx context.Context, page, pageSize int, sortBy, sortDir string) ([]*models.Payment, int64, error)
	FindByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Payment, error)
	FindByUserIDAndStatus(ctx context.Context, userID uuid.UUID, statusID uuid.UUID) ([]*models.Payment, error)
	FindByEmail(ctx context.Context, email string) ([]*models.Payment, error)
	UpdatePayment(ctx context.Context, paymentID uuid.UUID, req dto.UpdatePaymentRequest) (*models.Payment, error)
	DeletePayment(ctx context.Context, id uuid.UUID) error
}

type paymentService struct {
	paymentRepo         repository.PaymentRepository
	paymentStatusRepo   repository.PaymentStatusRepository
	userRepo            repository.UserRepository
	authService         AuthService
	emailSvc            email.Service
	rejectionReasonRepo repository.RejectionReasonRepository
	log                 *zap.Logger
}

func NewPaymentService(
	paymentRepo repository.PaymentRepository,
	paymentStatusRepo repository.PaymentStatusRepository,
	userRepo repository.UserRepository,
	authService AuthService,
	emailSvc email.Service,
	rejectionReasonRepo repository.RejectionReasonRepository,
	log *zap.Logger,
) PaymentService {
	return &paymentService{
		paymentRepo:         paymentRepo,
		paymentStatusRepo:   paymentStatusRepo,
		userRepo:            userRepo,
		authService:         authService,
		emailSvc:            emailSvc,
		rejectionReasonRepo: rejectionReasonRepo,
		log:                 log,
	}
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

func (s *paymentService) FindAllPaginated(ctx context.Context, page, pageSize int, sortBy, sortDir string) ([]*models.Payment, int64, error) {
	return s.paymentRepo.FindAllPaginated(ctx, page, pageSize, sortBy, sortDir)
}

func (s *paymentService) FindByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Payment, error) {
	return s.paymentRepo.FindByUserID(ctx, userID)
}

func (s *paymentService) FindByEmail(ctx context.Context, email string) ([]*models.Payment, error) {
	return s.paymentRepo.FindByEmail(ctx, email)
}

func (s *paymentService) FindByUserIDAndStatus(ctx context.Context, userID uuid.UUID, statusID uuid.UUID) ([]*models.Payment, error) {
	return s.paymentRepo.FindByUserIDAndStatus(ctx, userID, statusID)
}

func userNameFromEmail(email string) string {
	parts := strings.SplitN(email, "@", 2)
	if len(parts) > 0 && parts[0] != "" {
		return parts[0]
	}
	return "Usuario"
}

func formatPremiumUntil(t time.Time) string {
	months := []string{
		"enero", "febrero", "marzo", "abril", "mayo", "junio",
		"julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
	}
	return fmt.Sprintf("%d de %s de %d", t.Day(), months[t.Month()-1], t.Year())
}

func calculatePremiumUntil(current *time.Time, numberOfMonths int, now time.Time) time.Time {
	base := now
	if current != nil && current.After(now) {
		base = *current
	}
	return base.AddDate(0, numberOfMonths, 0)
}

func (s *paymentService) UpdatePayment(ctx context.Context, paymentID uuid.UUID, req dto.UpdatePaymentRequest) (*models.Payment, error) {
	payment, err := s.paymentRepo.FindByID(ctx, paymentID)
	if err != nil {
		return nil, err
	}

	statusID, err := uuid.Parse(req.StatusID)
	if err != nil {
		return nil, err
	}

	paymentStatus, err := s.paymentStatusRepo.FindByID(ctx, statusID)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	var rejectionReasonID *uuid.UUID

	switch statusID.String() {
	case models.ApprovedStatusID:
		payment.ApprovedAt = &now
		payment.RejectedAt = nil
		payment.RejectionReasonID = nil
		payment.RejectionMessage = nil

	case models.RejectedStatusID:
		payment.RejectedAt = &now
		payment.ApprovedAt = nil
		if req.RejectionReasonID != nil {
			id, err := uuid.Parse(*req.RejectionReasonID)
			if err != nil {
				return nil, err
			}
			rejectionReasonID = &id
			payment.RejectionReasonID = &id
		}
		payment.RejectionMessage = req.RejectionMessage

	default:
		payment.ApprovedAt = nil
		payment.RejectedAt = nil
		payment.RejectionReasonID = nil
		payment.RejectionMessage = nil
	}

	payment.StatusID = statusID
	payment.PaymentStatus = *paymentStatus

	if err := s.paymentRepo.Update(ctx, payment); err != nil {
		return nil, err
	}

	user, err := s.userRepo.FindByID(ctx, payment.UserID)
	if err != nil {
		return nil, err
	}

	g, gCtx := errgroup.WithContext(ctx)

	switch statusID.String() {
	case models.ApprovedStatusID:
		premiumUntil := calculatePremiumUntil(user.PremiumUntil, payment.NumberOfMonths, now)
		user.IsPremium = true
		user.PremiumUntil = &premiumUntil

		g.Go(func() error {
			return s.userRepo.Update(gCtx, user)
		})
		g.Go(func() error {
			return s.authService.UpdateUserPremium(gCtx, user.BetterAuthUserID, true, &premiumUntil)
		})

	case models.RejectedStatusID:
		user.IsPremium = false
		user.PremiumUntil = nil

		g.Go(func() error {
			return s.userRepo.Update(gCtx, user)
		})
		g.Go(func() error {
			return s.authService.UpdateUserPremium(gCtx, user.BetterAuthUserID, false, nil)
		})
	}

	if err := g.Wait(); err != nil {
		return nil, err
	}

	userName := userNameFromEmail(user.Email)

	switch statusID.String() {
	case models.ApprovedStatusID:
		premiumUntil := calculatePremiumUntil(user.PremiumUntil, payment.NumberOfMonths, now)
		go s.sendApprovedEmail(user.Email, userName, premiumUntil)

	case models.RejectedStatusID:
		reasonText := ""
		if rejectionReasonID != nil {
			reason, err := s.rejectionReasonRepo.FindByID(ctx, *rejectionReasonID)
			if err == nil {
				reasonText = reason.Reason
			} else {
				s.log.Error("failed to fetch rejection reason", zap.Error(err))
			}
		}
		customMsg := ""
		if req.RejectionMessage != nil {
			customMsg = *req.RejectionMessage
		}
		go s.sendRejectedEmail(user.Email, userName, reasonText, customMsg)
	}

	return payment, nil
}

func (s *paymentService) sendApprovedEmail(to, userName string, premiumUntil time.Time) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := s.emailSvc.SendPaymentApproved(ctx, to, userName, formatPremiumUntil(premiumUntil)); err != nil {
		s.log.Error("failed to send approved email", zap.String("to", to), zap.Error(err))
		return
	}
	s.log.Info("approved email sent", zap.String("to", to))
}

func (s *paymentService) sendRejectedEmail(to, userName, reason, customMessage string) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := s.emailSvc.SendPaymentRejected(ctx, to, userName, reason, customMessage); err != nil {
		s.log.Error("failed to send rejected email", zap.String("to", to), zap.Error(err))
		return
	}
	s.log.Info("rejected email sent", zap.String("to", to))
}

func (s *paymentService) DeletePayment(ctx context.Context, id uuid.UUID) error {
	return s.paymentRepo.Delete(ctx, id)
}
