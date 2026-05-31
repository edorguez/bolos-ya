package repository

import (
	"context"
	"fmt"
	"strings"
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
	FindAllPaginated(ctx context.Context, page, pageSize int, sortBy, sortDir string) ([]*models.Payment, int64, error)
	FindByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Payment, error)
	FindByUserIDAndStatus(ctx context.Context, userID uuid.UUID, statusID uuid.UUID) ([]*models.Payment, error)
	FindByEmail(ctx context.Context, email string) ([]*models.Payment, error)
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
		Preload("PaymentStatus").
		Preload("RejectionReason").
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
		Preload("PaymentStatus").
		Preload("RejectionReason").
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

var sortFieldMap = map[string]string{
	"paidAt":         "payments.paid_at",
	"email":          "users.email",
	"numberOfMonths": "payments.number_of_months",
	"amountBs":       "payments.amount_bs",
	"referenceNumber": "payments.reference_number",
	"status":         "payment_statuses.name",
	"createdAt":      "payments.created_at",
}

func (r *paymentRepository) FindAllPaginated(ctx context.Context, page, pageSize int, sortBy, sortDir string) ([]*models.Payment, int64, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	sortDir = strings.ToLower(sortDir)
	if sortDir != "asc" && sortDir != "desc" {
		sortDir = "desc"
	}

	sortColumn, ok := sortFieldMap[sortBy]
	if !ok {
		sortColumn = sortFieldMap["createdAt"]
		sortDir = "desc"
	}

	var total int64
	countDb := r.db.WithContext(ctx).Model(&models.Payment{}).Where("payments.deleted_at IS NULL")
	if err := countDb.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("count payments: %w", err)
	}

	db := r.db.WithContext(ctx).
		Preload("User").
		Preload("PaymentStatus").
		Preload("RejectionReason").
		Where("payments.deleted_at IS NULL")

	switch sortBy {
	case "email":
		db = db.Joins("JOIN users ON users.id = payments.user_id")
	case "status":
		db = db.Joins("JOIN payment_statuses ON payment_statuses.id = payments.status_id")
	}

	var payments []models.Payment
	if err := db.
		Order(fmt.Sprintf("%s %s", sortColumn, sortDir)).
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&payments).Error; err != nil {
		return nil, 0, fmt.Errorf("find payments paginated: %w", err)
	}

	result := make([]*models.Payment, len(payments))
	for i := range payments {
		result[i] = &payments[i]
	}
	return result, total, nil
}

func (r *paymentRepository) FindByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Payment, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	var payments []models.Payment
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("PaymentStatus").
		Preload("RejectionReason").
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

func (r *paymentRepository) FindByUserIDAndStatus(ctx context.Context, userID uuid.UUID, statusID uuid.UUID) ([]*models.Payment, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	var payments []models.Payment
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("PaymentStatus").
		Preload("RejectionReason").
		Where("user_id = ? AND status_id = ? AND deleted_at IS NULL", userID, statusID).
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
		Preload("PaymentStatus").
		Preload("RejectionReason").
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
