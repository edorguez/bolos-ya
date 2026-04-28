package constants

// Application constants
const (
	// App info
	AppName    = "Bolos Ya"
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
	CtxUserIDKey = "userID"
	CtxUserKey   = "user"

	// Cart statuses
	CartStatusActive   = "active"
	CartStatusArchived = "archived"
	CartStatusDeleted  = "deleted"
)
