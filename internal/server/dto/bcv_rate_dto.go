package dto

type BCVRateResponse struct {
	ID        string `json:"id"`
	RateDate  string `json:"rateDate"`
	UsdRate   int64  `json:"usdRate"`
	EurRate   int64  `json:"eurRate"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}
