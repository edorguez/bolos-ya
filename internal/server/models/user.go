package models

import (
	"time"

	"github.com/edorguez/bolos-ya/pkg/constants"
	"github.com/edorguez/bolos-ya/pkg/models"
)

// User represents an application user in the system.
// Authentication credentials are managed by better-auth.
// This table stores app-specific user data.
type User struct {
	models.BaseModel
	BetterAuthUserID string     `gorm:"type:varchar(255);uniqueIndex;not null"`
	Email            string     `gorm:"type:varchar(100);uniqueIndex"`
	AuthProvider     string     `gorm:"type:varchar(50);check:auth_provider IN ('email', 'google', 'guest')"`
	IsPremium        bool       `gorm:"default:false"`
	IsAnonymous      bool       `gorm:"default:false"`
	PremiumUntil     *time.Time `gorm:"type:timestamp"`
}

// NewUserFromBetterAuth creates a new application user record from better-auth data
func NewUserFromBetterAuth(betterAuthUserID, email, authProvider string, isAnonymous bool) *User {
	return &User{
		BetterAuthUserID: betterAuthUserID,
		Email:            email,
		AuthProvider:     authProvider,
		IsPremium:        false,
		IsAnonymous:      isAnonymous,
		PremiumUntil:     nil,
	}
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
