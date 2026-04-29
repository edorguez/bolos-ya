package dto

type SyncUserRequest struct {
	BetterAuthUserID string `json:"betterAuthUserId" validate:"required,max=255"`
	Email            string `json:"email" validate:"required,email,max=100"`
	AuthProvider     string `json:"authProvider" validate:"required,oneof=email google guest"`
	IsPremium        bool   `json:"isPremium"`
	PremiumUntil     string `json:"premiumUntil"`
}

type SyncUserResponse struct {
	ID               string `json:"id"`
	BetterAuthUserID string `json:"betterAuthUserId"`
	Email            string `json:"email"`
	AuthProvider     string `json:"authProvider"`
	IsPremium        bool   `json:"isPremium"`
	PremiumUntil     string `json:"premiumUntil"`
	CreatedAt        string `json:"createdAt"`
	UpdatedAt        string `json:"updatedAt"`
}

type GetMeResponse struct {
	UserID string `json:"userId"`
}
