package constants

// User plan limits
const (
	// Free plan limits
	FreeMaxActiveCarts    = 1
	FreeMaxCartItems      = 20
	FreeMaxSavedProducts  = 10
	FreeMaxPriceReports   = 5
	FreeMaxOCRScansPerDay = 3

	// Premium plan limits (unlimited or higher)
	PremiumMaxActiveCarts    = 10  // or 0 for unlimited
	PremiumMaxCartItems      = 100 // or 0 for unlimited
	PremiumMaxSavedProducts  = 100
	PremiumMaxPriceReports   = 50
	PremiumMaxOCRScansPerDay = 50

	// Plan identifiers
	PlanFree    = "free"
	PlanPremium = "premium"

	// Premium subscription durations
	PremiumDurationMonthly = 30  // days
	PremiumDurationYearly  = 365 // days
)
