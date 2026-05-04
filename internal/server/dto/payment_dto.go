package dto

type CreatePaymentRequest struct {
	NumberOfMonths  int    `json:"numberOfMonths" validate:"required,min=1,max=12"`
	ReferenceNumber string `json:"referenceNumber" validate:"required,max=50"`
	BankName        string `json:"bankName" validate:"required,max=80"`
	AmountBs        int64  `json:"amountBs" validate:"required,min=1"`
	PriceBcv        int64  `json:"priceBcv" validate:"required,min=1"`
	IsDiscount      bool   `json:"isDiscount" validate:"required"`
	PaidAt          string `json:"paidAt" validate:"required"`
}

type UpdatePaymentRequest struct {
	PaymentID   string `json:"paymentId" validate:"required,uuid"`
	IsConfirmed bool   `json:"isConfirmed" validate:"required"`
}

type PaymentUserResponse struct {
	ID            string  `json:"id"`
	Email         string  `json:"email"`
	AuthProvider  string  `json:"authProvider"`
	IsPremium     bool    `json:"isPremium"`
	PremiumUntil  *string `json:"premiumUntil"`
}

type PaymentResponse struct {
	ID              string               `json:"id"`
	UserID          string               `json:"userId"`
	NumberOfMonths  int                  `json:"numberOfMonths"`
	ReferenceNumber string               `json:"referenceNumber"`
	BankName        string               `json:"bankName"`
	AmountBs        int64                `json:"amountBs"`
	PriceBcv        int64                `json:"priceBcv"`
	IsDiscount      bool                 `json:"isDiscount"`
	PaidAt          string               `json:"paidAt"`
	IsConfirmed     bool                 `json:"isConfirmed"`
	CreatedAt       string               `json:"createdAt"`
	UpdatedAt       string               `json:"updatedAt"`
	DeletedAt       *string              `json:"deletedAt,omitempty"`
	User            PaymentUserResponse  `json:"user"`
}
