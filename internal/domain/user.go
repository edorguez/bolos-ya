package domain

import (
	"time"

	"github.com/google/uuid"
)

// User represents a user in the system
type User struct {
	ID           uuid.UUID  `json:"id"`
	Email        string     `json:"email"`
	GoogleID     *string    `json:"googleId,omitempty"`
	AuthProvider string     `json:"authProvider"` // "email", "google", "guest"
	PasswordHash *string    `json:"-"` // Never expose in JSON
	IsPremium    bool       `json:"isPremium"`
	PremiumUntil *time.Time `json:"premiumUntil,omitempty"`
	LastSyncAt   *time.Time `json:"lastSyncAt,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
	DeletedAt    *time.Time `json:"deletedAt,omitempty"`
}

// NewUser creates a new User with default values
func NewUser(email, authProvider string) *User {
	now := time.Now()
	return &User{
		ID:           uuid.New(),
		Email:        email,
		AuthProvider: authProvider,
		IsPremium:    false,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
}

// NewUserWithPassword creates a new user with email/password authentication
func NewUserWithPassword(email, passwordHash string) *User {
	user := NewUser(email, "email")
	user.PasswordHash = &passwordHash
	return user
}

// IsGuest returns true if the user is a guest (temporary) user
func (u *User) IsGuest() bool {
	return u.AuthProvider == "guest"
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
