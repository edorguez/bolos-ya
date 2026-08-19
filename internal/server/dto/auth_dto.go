package dto

type SyncUserRequest struct {
	Email        string `json:"email" validate:"omitempty,email,max=100"`
	Name         string `json:"name" validate:"omitempty,max=20"`
	AuthProvider string `json:"authProvider" validate:"omitempty,oneof=email google guest"`
	IsPremium    bool   `json:"isPremium"`
	IsAnonymous  bool   `json:"isAnonymous"`
	PremiumUntil string `json:"premiumUntil"`
}

type SyncUserResponse struct {
	ID               string `json:"id"`
	BetterAuthUserID string `json:"betterAuthUserId"`
	Email            string `json:"email"`
	Name             string `json:"name"`
	AuthProvider     string `json:"authProvider"`
	IsPremium        bool   `json:"isPremium"`
	IsAnonymous      bool   `json:"isAnonymous"`
	PremiumUntil     string `json:"premiumUntil"`
	CreatedAt        string `json:"createdAt"`
	UpdatedAt        string `json:"updatedAt"`
}

type GetMeResponse struct {
	UserID       string  `json:"userId"`
	Name         string  `json:"name"`
	IsPremium    bool    `json:"isPremium"`
	IsAnonymous  bool    `json:"isAnonymous"`
	PremiumUntil *string `json:"premiumUntil"`
}

type MigrateUserDataRequest struct {
	FromBetterAuthUserId string          `json:"fromBetterAuthUserId" validate:"required"`
	ToBetterAuthUserId   string          `json:"toBetterAuthUserId"   validate:"required"`
	Email                string          `json:"email"`
	Name                 string          `json:"name"`
	AuthProvider         string          `json:"authProvider"`
	Operations           []SyncOperation `json:"operations,omitempty"`
}

type ForgotPasswordRequest struct {
	Email    string `json:"email" validate:"required,email,max=100"`
	Name     string `json:"name" validate:"omitempty,max=20"`
	ResetURL string `json:"resetUrl" validate:"required"`
}
