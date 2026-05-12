package dto

type CreateSupermarketRequest struct {
	Name     string  `json:"name" validate:"required,max=100"`
	ImageUrl *string `json:"imageUrl" validate:"omitempty,max=500"`
}

type SupermarketResponse struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	IsCustom  bool    `json:"isCustom"`
	ImageUrl  *string `json:"imageUrl"`
	UserID    *string `json:"userId"`
	CreatedAt string  `json:"createdAt"`
	UpdatedAt string  `json:"updatedAt"`
	DeletedAt *string `json:"deletedAt,omitempty"`
}
