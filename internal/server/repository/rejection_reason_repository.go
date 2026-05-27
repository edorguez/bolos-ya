package repository

import (
	"context"
	"time"

	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/internal/server/models"
)

type RejectionReasonRepository interface {
	FindAll(ctx context.Context) ([]*models.RejectionReason, error)
}

type rejectionReasonRepository struct {
	db *gorm.DB
}

func NewRejectionReasonRepository(db *gorm.DB) RejectionReasonRepository {
	return &rejectionReasonRepository{db: db}
}

func (r *rejectionReasonRepository) FindAll(ctx context.Context) ([]*models.RejectionReason, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	var reasons []models.RejectionReason
	if err := r.db.WithContext(ctx).Order("reason ASC").Find(&reasons).Error; err != nil {
		return nil, err
	}
	result := make([]*models.RejectionReason, len(reasons))
	for i := range reasons {
		result[i] = &reasons[i]
	}
	return result, nil
}
