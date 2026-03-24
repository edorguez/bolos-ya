package models

import (
	"time"

	"gorm.io/gorm"

	"github.com/edorguez/bolos-ya/pkg/constants"
	"github.com/edorguez/bolos-ya/pkg/models"
)

// User represents a user in the system
type User struct {
	models.SoftDeleteModel
	Email        string  `gorm:"type:varchar(255);uniqueIndex"`
	GoogleID     *string `gorm:"type:varchar(255);uniqueIndex"`
	AuthProvider string  `gorm:"type:varchar(50);check:auth_provider IN ('email', 'google', 'guest')"`
	PasswordHash *string `gorm:"type:varchar(255)"`
	IsPremium    bool    `gorm:"default:false"`
	PremiumUntil *time.Time
	LastSyncAt   *time.Time
}

// TableName returns the table name for the model
func (User) TableName() string {
	return "users"
}

// NewUser creates a new User with default values
func NewUser(email, authProvider string) *User {
	now := time.Now()
	user := &User{
		Email:        email,
		AuthProvider: authProvider,
		IsPremium:    false,
	}
	user.CreatedAt = now
	user.UpdatedAt = now
	return user
}

// NewUserWithPassword creates a new user with email/password authentication
func NewUserWithPassword(email, passwordHash string) *User {
	user := NewUser(email, constants.AuthProviderEmail)
	user.PasswordHash = &passwordHash
	return user
}

// IsGuest returns true if the user is a guest (temporary) user
func (u *User) IsGuest() bool {
	return u.AuthProvider == constants.AuthProviderGuest
}

// IsActivePremium returns true if the user has an active premium subscription
func (u *User) IsActivePremium() bool {
	if !u.IsPremium {
		return false
	}
	if u.PremiumUntil == nil {
		return false
	}
	return u.PremiumUntil.After(time.Now())
}

// HasPassword returns true if the user has a password set
func (u *User) HasPassword() bool {
	return u.PasswordHash != nil && *u.PasswordHash != ""
}

// BeforeCreate ensures default values before creation
func (u *User) BeforeCreate(tx *gorm.DB) error {
	return u.SoftDeleteModel.BeforeCreate(tx)
}

// BeforeUpdate ensures updated_at is set before update
func (u *User) BeforeUpdate(tx *gorm.DB) error {
	return u.SoftDeleteModel.BeforeUpdate(tx)
}
