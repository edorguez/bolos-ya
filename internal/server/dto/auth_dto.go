package dto

type SyncUserRequest struct {
	Email        string `json:"email" validate:"omitempty,email,max=100"`
	AuthProvider string `json:"authProvider" validate:"omitempty,oneof=email google guest"`
	IsPremium    bool   `json:"isPremium"`
	PremiumUntil string `json:"premiumUntil"`
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
