package repository

import (
	"context"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/edorguez/bolos-ya/internal/server/models"
	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"
)

type BCVRateRepository interface {
	GetLatest(ctx context.Context) (*models.BCVRate, error)
	Upsert(ctx context.Context, rate *models.BCVRate) error
}

type bcvRateRepository struct {
	db *gorm.DB
}

func NewBCVRateRepository(db *gorm.DB) BCVRateRepository {
	return &bcvRateRepository{db: db}
}

func (r *bcvRateRepository) GetLatest(ctx context.Context) (*models.BCVRate, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var rate models.BCVRate
	if err := r.db.WithContext(ctx).
		Where("deleted_at IS NULL").
		Order("rate_date DESC").
		First(&rate).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, apperrors.ErrNotFound
		}
		return nil, err
	}
	return &rate, nil
}

func (r *bcvRateRepository) Upsert(ctx context.Context, rate *models.BCVRate) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).
		Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "rate_date"}},
			DoUpdates: clause.AssignmentColumns([]string{"usd_rate", "eur_rate", "updated_at"}),
		}).
		Create(rate).Error
}
