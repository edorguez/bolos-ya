package dto

type CreateCartRequest struct {
	SupermarketID  *string                    `json:"supermarketId" validate:"omitempty,uuid"`
	NewSupermarket *CreateSupermarketRequest  `json:"newSupermarket" validate:"omitempty"`
	BudgetBs       int64                      `json:"budgetBs" validate:"min=0"`
	BudgetUsd      int64                      `json:"budgetUsd" validate:"min=0"`
}

type AddProductRequest struct {
	CartID        string `json:"cartId" validate:"required,uuid"`
	ProductID     string `json:"productId" validate:"required,uuid"`
	Quantity      int    `json:"quantity" validate:"required,min=1"`
	IsManualEntry bool   `json:"isManualEntry"`
}

type UpdateProductQuantityRequest struct {
	CartProductID string `json:"cartProductId" validate:"required,uuid"`
	CartID         string `json:"cartId" validate:"required,uuid"`
	Quantity      int    `json:"quantity" validate:"required,min=1"`
}

type CartResponse struct {
	ID               string `json:"id"`
	SupermarketID    string `json:"supermarketId"`
	UserID           string `json:"userId"`
	IsActive         bool   `json:"isActive"`
	BudgetBs         int64  `json:"budgetBs"`
	BudgetUsd        int64  `json:"budgetUsd"`
	TotalEstimatedBs *int64 `json:"totalEstimatedBs"`
	TotalEstimatedUsd *int64 `json:"totalEstimatedUsd"`
	CreatedAt        string `json:"createdAt"`
	UpdatedAt        string `json:"updatedAt"`
}

type CartProductResponse struct {
	ID            string `json:"id"`
	CartID        string `json:"cartId"`
	ProductID     string `json:"productId"`
	Quantity      int    `json:"quantity"`
	IsManualEntry bool   `json:"isManualEntry"`
	CreatedAt     string `json:"createdAt"`
	UpdatedAt     string `json:"updatedAt"`
}
