package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/edorguez/merki/internal/server/models"
	"github.com/edorguez/merki/pkg/constants"
	"github.com/edorguez/merki/pkg/core/errors"
)

type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	FindByEmail(ctx context.Context, email string) (*models.User, error)
	FindByBetterAuthUserID(ctx context.Context, betterAuthUserID string) (*models.User, error)
	FindByBetterAuthUserIDUnscoped(ctx context.Context, betterAuthUserID string) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Restore(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id uuid.UUID) error
	TransferUserData(ctx context.Context, fromUserID, toUserID uuid.UUID) error
	DeleteAccount(ctx context.Context, userID uuid.UUID) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Create(user).Error
}

func (r *userRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
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

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
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

func (r *userRepository) FindByBetterAuthUserID(ctx context.Context, betterAuthUserID string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var user models.User
	if err := r.db.WithContext(ctx).First(&user, "better_auth_user_id = ?", betterAuthUserID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return &user, nil
}

// FindByBetterAuthUserIDUnscoped retrieves a user by its better-auth ID
// regardless of soft-deletion status. Used to recover users that were
// soft-deleted so a session token for them does not cause a unique-constraint
// conflict when re-creating the row.
func (r *userRepository) FindByBetterAuthUserIDUnscoped(ctx context.Context, betterAuthUserID string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var user models.User
	if err := r.db.WithContext(ctx).Unscoped().
		First(&user, "better_auth_user_id = ?", betterAuthUserID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrNotFound
		}
		return nil, err
	}

	return &user, nil
}

// Restore clears the soft-delete marker on a user (updating its fields in the
// same write) so a session token for it keeps working instead of failing with
// a unique-constraint conflict on better_auth_user_id.
func (r *userRepository) Restore(ctx context.Context, user *models.User) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	user.DeletedAt = gorm.DeletedAt{}
	return r.db.WithContext(ctx).Unscoped().Save(user).Error
}

func (r *userRepository) Update(ctx context.Context, user *models.User) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Save(user).Error
}

func (r *userRepository) Delete(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Delete(&models.User{}, "id = ?", id).Error
}

func (r *userRepository) TransferUserData(ctx context.Context, fromUserID, toUserID uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec(`UPDATE carts SET user_id = ? WHERE user_id = ?`, toUserID, fromUserID).Error; err != nil {
			return err
		}
		if err := tx.Exec(`UPDATE products SET user_id = ? WHERE user_id = ?`, toUserID, fromUserID).Error; err != nil {
			return err
		}
		if err := tx.Exec(`UPDATE supermarkets SET user_id = ? WHERE user_id = ?`, toUserID, fromUserID).Error; err != nil {
			return err
		}
		if err := tx.Exec(`UPDATE payments SET user_id = ? WHERE user_id = ?`, toUserID, fromUserID).Error; err != nil {
			return err
		}
		return nil
	})
}

// DeleteAccount permanently removes a user's account while preserving the carts,
// cart products, products and supermarkets it created. Those rows are detached
// from the deleted account and re-assigned to a fixed internal "tombstone" user
// (no email, no personal data) so referential integrity is kept and the records
// never leak back to real users. The user's payments are deleted outright since
// they contain personal/financial information.
//
// The operation is idempotent: running it again for an already-removed user is a
// no-op, so a retry after a partial failure is safe.
func (r *userRepository) DeleteAccount(ctx context.Context, userID uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	tombstoneID := uuid.MustParse(constants.DeletedAccountUserID)

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Ensure the tombstone row exists before rows are re-assigned to it
		// (its user_id foreign key must resolve).
		if err := tx.Exec(
			`INSERT INTO users (id, better_auth_user_id, name, auth_provider, is_anonymous, created_at, updated_at)
			 VALUES (?, ?, 'cuenta eliminada', 'guest', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
			 ON CONFLICT DO NOTHING`,
			tombstoneID, constants.DeletedAccountBAUserID,
		).Error; err != nil {
			return err
		}

		// Preserve the user's carts/products/supermarkets under the tombstone.
		if err := tx.Exec(`UPDATE supermarkets SET user_id = ? WHERE user_id = ?`, tombstoneID, userID).Error; err != nil {
			return err
		}
		if err := tx.Exec(`UPDATE products SET user_id = ? WHERE user_id = ?`, tombstoneID, userID).Error; err != nil {
			return err
		}
		if err := tx.Exec(`UPDATE carts SET user_id = ? WHERE user_id = ?`, tombstoneID, userID).Error; err != nil {
			return err
		}

		// Payments hold personal data (identification, bank, reference) — purge.
		if err := tx.Exec(`DELETE FROM payments WHERE user_id = ?`, userID).Error; err != nil {
			return err
		}

		// Hard-delete the account row (no soft-delete tombstone left behind).
		return tx.Exec(`DELETE FROM users WHERE id = ?`, userID).Error
	})
}
