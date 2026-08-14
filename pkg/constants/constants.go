package constants

// Application constants
const (
	// App info
	AppName    = "Merki"
	AppVersion = "1.0.0"

	// Environment
	EnvDevelopment = "development"
	EnvStaging     = "staging"
	EnvProduction  = "production"

	// Auth providers
	AuthProviderEmail  = "email"
	AuthProviderGoogle = "google"
	AuthProviderGuest  = "guest"

	// Auth headers (set by Expo API routes after better-auth session validation)
	UserIDHeader       = "X-User-ID"
	UserEmailHeader    = "X-User-Email"
	UserProviderHeader = "X-Auth-Provider"

	// Context keys
	CtxUserIDKey   = "userID"
	CtxUserKey     = "user"
	CtxUserRoleKey = "userRole"

	// Cart statuses
	CartStatusActive   = "active"
	CartStatusArchived = "archived"
	CartStatusDeleted  = "deleted"

	// TimeFormat is the RFC3339 time format used across the API
	TimeFormat = "2006-01-02T15:04:05Z07:00"
)
