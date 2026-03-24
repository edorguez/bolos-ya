package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/pkg/core/errors"
)

// GormUserRepository implements UserRepository using GORM
type GormUserRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new UserRepository
func NewUserRepository(db *gorm.DB) *GormUserRepository {
	return &GormUserRepository{db: db}
}

// Create inserts a new user into the database
func (r *GormUserRepository) Create(ctx context.Context, user *models.User) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Create(user).Error
}

// FindByID retrieves a user by ID
func (r *GormUserRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var user models.User
	if err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return &user, nil
}

// FindByEmail retrieves a user by email
func (r *GormUserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var user models.User
	if err := r.db.WithContext(ctx).First(&user, "email = ?", email).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return &user, nil
}

// FindByGoogleID retrieves a user by Google ID
func (r *GormUserRepository) FindByGoogleID(ctx context.Context, googleID string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var user models.User
	if err := r.db.WithContext(ctx).First(&user, "google_id = ?", googleID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return &user, nil
}

// Update updates an existing user
func (r *GormUserRepository) Update(ctx context.Context, user *models.User) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Save(user).Error
}

// Delete soft deletes a user by ID
func (r *GormUserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.User{}, "id = ?", id).Error
}
