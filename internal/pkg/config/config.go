package config

import (
	"fmt"
	"time"

	"github.com/spf13/viper"
)

// Config holds all configuration for the application
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
	Google   GoogleOAuthConfig
	AWS      AWSConfig
	BCV      BCVConfig
	App      AppConfig
	Features FeaturesConfig
}

// ServerConfig holds HTTP server configuration
type ServerConfig struct {
	Host         string        `mapstructure:"host"`
	Port         int           `mapstructure:"port"`
	ReadTimeout  time.Duration `mapstructure:"read_timeout"`
	WriteTimeout time.Duration `mapstructure:"write_timeout"`
}

// DatabaseConfig holds PostgreSQL database configuration
type DatabaseConfig struct {
	URL          string `mapstructure:"url"`
	MaxOpenConns int    `mapstructure:"max_open_conns"`
	MaxIdleConns int    `mapstructure:"max_idle_conns"`
}

// RedisConfig holds Redis cache configuration
type RedisConfig struct {
	URL      string `mapstructure:"url"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
}

// JWTConfig holds JWT authentication configuration
type JWTConfig struct {
	Secret                 string        `mapstructure:"secret"`
	AccessTokenExpiry      time.Duration `mapstructure:"access_token_expiry"`
	RefreshTokenExpiry     time.Duration `mapstructure:"refresh_token_expiry"`
	Issuer                 string        `mapstructure:"issuer"`
}

// GoogleOAuthConfig holds Google OAuth configuration
type GoogleOAuthConfig struct {
	ClientID     string `mapstructure:"client_id"`
	ClientSecret string `mapstructure:"client_secret"`
}

// AWSConfig holds AWS S3 configuration
type AWSConfig struct {
	Region          string `mapstructure:"region"`
	AccessKeyID     string `mapstructure:"access_key_id"`
	SecretAccessKey string `mapstructure:"secret_access_key"`
	BucketName      string `mapstructure:"bucket_name"`
	Endpoint        string `mapstructure:"endpoint"`
}

// BCVConfig holds BCV API configuration
type BCVConfig struct {
	URL     string        `mapstructure:"url"`
	Timeout time.Duration `mapstructure:"timeout"`
}

// AppConfig holds general application configuration
type AppConfig struct {
	Env            string   `mapstructure:"env"`
	Debug          bool     `mapstructure:"debug"`
	AllowedOrigins []string `mapstructure:"allowed_origins"`
}

// FeaturesConfig holds feature flag configuration
type FeaturesConfig struct {
	OCREnabled           bool `mapstructure:"ocr_enabled"`
	PremiumEnabled       bool `mapstructure:"premium_enabled"`
	PriceConfidenceEnabled bool `mapstructure:"price_confidence_enabled"`
}

// Load loads configuration from environment variables and .env file
func Load() (*Config, error) {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()

	// Set defaults
	setDefaults()

	// Try to read .env file (ignore if not found)
	_ = viper.ReadInConfig()

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	return &cfg, nil
}

func setDefaults() {
	// Server defaults
	viper.SetDefault("SERVER_HOST", "0.0.0.0")
	viper.SetDefault("SERVER_PORT", 8080)
	viper.SetDefault("SERVER_READ_TIMEOUT", "30s")
	viper.SetDefault("SERVER_WRITE_TIMEOUT", "30s")

	// Database defaults
	viper.SetDefault("DB_MAX_OPEN_CONNS", 25)
	viper.SetDefault("DB_MAX_IDLE_CONNS", 5)

	// Redis defaults
	viper.SetDefault("REDIS_DB", 0)

	// JWT defaults
	viper.SetDefault("JWT_ACCESS_TOKEN_EXPIRY", "15m")
	viper.SetDefault("JWT_REFRESH_TOKEN_EXPIRY", "7d")
	viper.SetDefault("JWT_ISSUER", "bolos-ya")

	// BCV defaults
	viper.SetDefault("BCV_API_TIMEOUT", "10s")

	// App defaults
	viper.SetDefault("APP_ENV", "development")
	viper.SetDefault("APP_DEBUG", true)
	viper.SetDefault("APP_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:19006")

	// Feature defaults
	viper.SetDefault("FEATURE_OCR_ENABLED", true)
	viper.SetDefault("FEATURE_PREMIUM_ENABLED", false)
	viper.SetDefault("FEATURE_PRICE_CONFIDENCE_ENABLED", true)
}

// IsProduction returns true if the application is running in production
func (c *Config) IsProduction() bool {
	return c.App.Env == "production"
}

// IsDevelopment returns true if the application is running in development
func (c *Config) IsDevelopment() bool {
	return c.App.Env == "development"
}
