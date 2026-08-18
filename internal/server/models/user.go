package models

import (
	"strings"
	"time"

	"github.com/edorguez/merki/pkg/constants"
	"github.com/edorguez/merki/pkg/models"
)

// User represents an application user in the system.
// Authentication credentials are managed by better-auth.
// This table stores app-specific user data.
type User struct {
	models.BaseModel
	BetterAuthUserID string     `gorm:"type:varchar(255);uniqueIndex;not null"`
	Email            string     `gorm:"type:varchar(100);uniqueIndex"`
	Name             string     `gorm:"type:varchar(20);default:''"`
	AuthProvider     string     `gorm:"type:varchar(50);check:auth_provider IN ('email', 'google', 'guest')"`
	IsPremium        bool       `gorm:"default:false"`
	IsAnonymous      bool       `gorm:"default:false"`
	PremiumUntil     *time.Time `gorm:"type:timestamp"`
}

// NewUserFromBetterAuth creates a new application user record from better-auth data
func NewUserFromBetterAuth(betterAuthUserID, email, name, authProvider string, isAnonymous bool) *User {
	return &User{
		BetterAuthUserID: betterAuthUserID,
		Email:            email,
		Name:             name,
		AuthProvider:     authProvider,
		IsPremium:        false,
		IsAnonymous:      isAnonymous,
		PremiumUntil:     nil,
	}
}

// maxNameLength caps the application user name to the DB column size.
const maxNameLength = 20

// TruncateName returns the name trimmed and capped to maxNameLength runes.
func TruncateName(name string) string {
	name = strings.TrimSpace(name)
	runes := []rune(name)
	if len(runes) > maxNameLength {
		return string(runes[:maxNameLength])
	}
	return name
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
