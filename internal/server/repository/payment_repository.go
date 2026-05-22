package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/internal/server/models"
	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"
)

type PaymentRepository interface {
	Create(ctx context.Context, payment *models.Payment) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.Payment, error)
	FindAll(ctx context.Context) ([]*models.Payment, error)
	FindByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Payment, error)
	FindByEmail(ctx context.Context, email string) ([]*models.Payment, error)
	FindPendingByUserID(ctx context.Context, userID uuid.UUID) (*models.Payment, error)
	Update(ctx context.Context, payment *models.Payment) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type paymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) PaymentRepository {
	return &paymentRepository{db: db}
}

func (r *paymentRepository) Create(ctx context.Context, payment *models.Payment) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Create(payment).Error
}

func (r *paymentRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.Payment, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var payment models.Payment
	if err := r.db.WithContext(ctx).
		Preload("User").
		Where("deleted_at IS NULL").
		First(&payment, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}

	return &payment, nil
}

func (r *paymentRepository) FindAll(ctx context.Context) ([]*models.Payment, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var payments []models.Payment
	if err := r.db.WithContext(ctx).
		Preload("User").
		Where("deleted_at IS NULL").
		Order("created_at DESC").
		Find(&payments).Error; err != nil {
		return nil, err
	}

	result := make([]*models.Payment, len(payments))
	for i := range payments {
		result[i] = &payments[i]
	}
	return result, nil
}

func (r *paymentRepository) FindByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Payment, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var payments []models.Payment
	if err := r.db.WithContext(ctx).
		Preload("User").
		Where("user_id = ? AND deleted_at IS NULL", userID).
		Order("created_at DESC").
		Find(&payments).Error; err != nil {
		return nil, err
	}

	result := make([]*models.Payment, len(payments))
	for i := range payments {
		result[i] = &payments[i]
	}
	return result, nil
}

func (r *paymentRepository) FindByEmail(ctx context.Context, email string) ([]*models.Payment, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var payments []models.Payment
	if err := r.db.WithContext(ctx).
		Preload("User").
		Joins("JOIN users ON users.id = payments.user_id").
		Where("users.email = ? AND payments.deleted_at IS NULL", email).
		Order("payments.created_at DESC").
		Find(&payments).Error; err != nil {
		return nil, err
	}

	result := make([]*models.Payment, len(payments))
	for i := range payments {
		result[i] = &payments[i]
	}
	return result, nil
}

func (r *paymentRepository) FindPendingByUserID(ctx context.Context, userID uuid.UUID) (*models.Payment, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var payment models.Payment
	if err := r.db.WithContext(ctx).
		Preload("User").
		Where("user_id = ? AND is_confirmed = ? AND deleted_at IS NULL", userID, false).
		First(&payment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	return &payment, nil
}

func (r *paymentRepository) Update(ctx context.Context, payment *models.Payment) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Save(payment).Error
}

func (r *paymentRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.Payment{}, "id = ?", id).Error
}
