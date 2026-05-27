package repository

import (
	"context"
	"time"

	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/internal/server/models"
)

type PaymentStatusRepository interface {
	FindAll(ctx context.Context) ([]*models.PaymentStatus, error)
}

type paymentStatusRepository struct {
	db *gorm.DB
}

func NewPaymentStatusRepository(db *gorm.DB) PaymentStatusRepository {
	return &paymentStatusRepository{db: db}
}

func (r *paymentStatusRepository) FindAll(ctx context.Context) ([]*models.PaymentStatus, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	var statuses []models.PaymentStatus
	if err := r.db.WithContext(ctx).Order("name ASC").Find(&statuses).Error; err != nil {
		return nil, err
	}
	result := make([]*models.PaymentStatus, len(statuses))
	for i := range statuses {
		result[i] = &statuses[i]
	}
	return result, nil
}
