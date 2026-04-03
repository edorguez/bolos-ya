package models

import (
	"time"

	"github.com/edorguez/bolos-ya/pkg/constants"
	"github.com/edorguez/bolos-ya/pkg/models"
)

// User represents a user in the system
type User struct {
	models.BaseModel
	Email        string  `gorm:"type:varchar(100);uniqueIndex"`
	PasswordHash *string `gorm:"type:varchar"`
	GoogleID     *string `gorm:"type:varchar(255);uniqueIndex"`
	AuthProvider string  `gorm:"type:varchar(50);check:auth_provider IN ('email', 'google', 'guest')"`
	IsPremium    bool    `gorm:"default:false"`
	PremiumUntil *time.Time
}

// NewUserWithEmail creates a new user with email/password authentication
func NewUserEmail(email, passwordHash string) *User {
	user := &User{
		Email:        email,
		PasswordHash: &passwordHash,
		GoogleID:     nil,
		AuthProvider: constants.AuthProviderEmail,
		IsPremium:    false,
		PremiumUntil: nil,
	}
	return user
}

// NewUserGoogle creates a new with Google provider
func NewUserGoogle(email, googleId string) *User {
	user := &User{
		Email:        email,
		PasswordHash: nil,
		GoogleID:     &googleId,
		AuthProvider: constants.AuthProviderGoogle,
		IsPremium:    false,
		PremiumUntil: nil,
	}
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
