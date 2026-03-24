package models

import (
	"time"

	"gorm.io/gorm"
	
	"github.com/edorguez/bolos-ya/internal/domain"
	"github.com/edorguez/bolos-ya/internal/pkg/models"
)

// UserModel represents the database model for User
type UserModel struct {
	models.SoftDeleteModel
	Email        string     `gorm:"type:varchar(255);uniqueIndex"`
	GoogleID     *string    `gorm:"type:varchar(255);uniqueIndex"`
	AuthProvider string     `gorm:"type:varchar(50);check:auth_provider IN ('email', 'google', 'guest')"`
	PasswordHash *string    `gorm:"type:varchar(255)"`
	IsPremium    bool       `gorm:"default:false"`
	PremiumUntil *time.Time
	LastSyncAt   *time.Time
}

// TableName returns the table name for the model
func (UserModel) TableName() string {
	return "users"
}

// ToDomain converts the database model to a domain entity
func (m *UserModel) ToDomain() *domain.User {
	var googleID *string
	if m.GoogleID != nil && *m.GoogleID != "" {
		googleID = m.GoogleID
	}
	
	var deletedAt *time.Time
	if m.DeletedAt.Valid {
		deletedAt = &m.DeletedAt.Time
	}
	
	return &domain.User{
		ID:           m.ID,
		Email:        m.Email,
		GoogleID:     googleID,
		AuthProvider: m.AuthProvider,
		PasswordHash: m.PasswordHash,
		IsPremium:    m.IsPremium,
		PremiumUntil: m.PremiumUntil,
		LastSyncAt:   m.LastSyncAt,
		CreatedAt:    m.CreatedAt,
		UpdatedAt:    m.UpdatedAt,
		DeletedAt:    deletedAt,
	}
}

// FromDomain populates the database model from a domain entity
func (m *UserModel) FromDomain(user *domain.User) {
	m.ID = user.ID
	m.Email = user.Email
	m.GoogleID = user.GoogleID
	m.AuthProvider = user.AuthProvider
	m.PasswordHash = user.PasswordHash
	m.IsPremium = user.IsPremium
	m.PremiumUntil = user.PremiumUntil
	m.LastSyncAt = user.LastSyncAt
	m.CreatedAt = user.CreatedAt
	m.UpdatedAt = user.UpdatedAt
	if user.DeletedAt != nil {
		m.DeletedAt = gorm.DeletedAt{Time: *user.DeletedAt, Valid: true}
	} else {
		m.DeletedAt = gorm.DeletedAt{}
	}
}

// BeforeCreate ensures default values before creation
func (m *UserModel) BeforeCreate(tx *gorm.DB) error {
	return m.SoftDeleteModel.BeforeCreate(tx)
}

// BeforeUpdate ensures updated_at is set before update
func (m *UserModel) BeforeUpdate(tx *gorm.DB) error {
	return m.SoftDeleteModel.BeforeUpdate(tx)
}
