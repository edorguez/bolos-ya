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

	// Account deletion
	// DeletedAccountUserID is the fixed UUID of the internal "tombstone" user
	// that absorbs a deleted account's carts/products/supermarkets so they are
	// preserved without any remaining personal data.
	DeletedAccountUserID = "00000000-0000-4000-8000-0000000000de"
	// DeletedAccountBAUserID is the unique better_auth_user_id for that row.
	DeletedAccountBAUserID = "deleted-account"

	// Cart statuses
	CartStatusActive   = "active"
	CartStatusArchived = "archived"
	CartStatusDeleted  = "deleted"

	// TimeFormat is the RFC3339 time format used across the API
	TimeFormat = "2006-01-02T15:04:05Z07:00"
)
