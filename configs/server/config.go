package server

import (
	"fmt"
	"log"

	"github.com/joho/godotenv"
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
}

// ServerConfig holds HTTP server configuration
type ServerConfig struct {
	Port         int    `mapstructure:"port"`
	Host         string `mapstructure:"host"`
	ReadTimeout  string `mapstructure:"read_timeout"`
	WriteTimeout string `mapstructure:"write_timeout"`
}

// DatabaseConfig holds PostgreSQL database configuration
type DatabaseConfig struct {
	URL string `mapstructure:"url"`
}

// RedisConfig holds Redis cache configuration
type RedisConfig struct {
	DB       int    `mapstructure:"db"`
	Password string `mapstructure:"password"`
	URL      string `mapstructure:"url"`
}

// JWTConfig holds JWT authentication configuration
type JWTConfig struct {
	Secret             string `mapstructure:"secret"`
	AccessTokenExpiry  string `mapstructure:"access_token_expiry"`
	RefreshTokenExpiry string `mapstructure:"refresh_token_expiry"`
	Issuer             string `mapstructure:"issuer"`
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
	URL string `mapstructure:"url"`
}

// AppConfig holds general application configuration
type AppConfig struct {
	Env            string   `mapstructure:"env"`
	Debug          bool     `mapstructure:"debug"`
	AllowedOrigins []string `mapstructure:"allowed_origins"`
}

// bindEnvVars binds environment variables to viper keys
func bindEnvVars() error {
	// Server
	if err := viper.BindEnv("server.port", "PORT"); err != nil {
		return fmt.Errorf("failed to bind PORT: %w", err)
	}
	if err := viper.BindEnv("server.host", "SERVER_HOST"); err != nil {
		return fmt.Errorf("failed to bind SERVER_HOST: %w", err)
	}
	if err := viper.BindEnv("server.read_timeout", "SERVER_READ_TIMEOUT"); err != nil {
		return fmt.Errorf("failed to bind SERVER_READ_TIMEOUT: %w", err)
	}
	if err := viper.BindEnv("server.write_timeout", "SERVER_WRITE_TIMEOUT"); err != nil {
		return fmt.Errorf("failed to bind SERVER_WRITE_TIMEOUT: %w", err)
	}

	// Database
	if err := viper.BindEnv("database.url", "DATABASE_URL"); err != nil {
		return fmt.Errorf("failed to bind DATABASE_URL: %w", err)
	}

	// Redis
	if err := viper.BindEnv("redis.db", "REDIS_DB"); err != nil {
		return fmt.Errorf("failed to bind REDIS_DB: %w", err)
	}
	if err := viper.BindEnv("redis.password", "REDIS_PASSWORD"); err != nil {
		return fmt.Errorf("failed to bind REDIS_PASSWORD: %w", err)
	}
	if err := viper.BindEnv("redis.url", "REDIS_URL"); err != nil {
		return fmt.Errorf("failed to bind REDIS_URL: %w", err)
	}

	// JWT
	if err := viper.BindEnv("jwt.secret", "JWT_SECRET"); err != nil {
		return fmt.Errorf("failed to bind JWT_SECRET: %w", err)
	}
	if err := viper.BindEnv("jwt.access_token_expiry", "JWT_ACCESS_TOKEN_EXPIRY"); err != nil {
		return fmt.Errorf("failed to bind JWT_ACCESS_TOKEN_EXPIRY: %w", err)
	}
	if err := viper.BindEnv("jwt.refresh_token_expiry", "JWT_REFRESH_TOKEN_EXPIRY"); err != nil {
		return fmt.Errorf("failed to bind JWT_REFRESH_TOKEN_EXPIRY: %w", err)
	}
	if err := viper.BindEnv("jwt.issuer", "JWT_ISSUER"); err != nil {
		return fmt.Errorf("failed to bind JWT_ISSUER: %w", err)
	}

	// Google OAuth
	if err := viper.BindEnv("google.client_id", "GOOGLE_OAUTH_CLIENT_ID"); err != nil {
		return fmt.Errorf("failed to bind GOOGLE_OAUTH_CLIENT_ID: %w", err)
	}
	if err := viper.BindEnv("google.client_secret", "GOOGLE_OAUTH_CLIENT_SECRET"); err != nil {
		return fmt.Errorf("failed to bind GOOGLE_OAUTH_CLIENT_SECRET: %w", err)
	}

	// AWS
	if err := viper.BindEnv("aws.region", "AWS_REGION"); err != nil {
		return fmt.Errorf("failed to bind AWS_REGION: %w", err)
	}
	if err := viper.BindEnv("aws.access_key_id", "AWS_ACCESS_KEY_ID"); err != nil {
		return fmt.Errorf("failed to bind AWS_ACCESS_KEY_ID: %w", err)
	}
	if err := viper.BindEnv("aws.secret_access_key", "AWS_SECRET_ACCESS_KEY"); err != nil {
		return fmt.Errorf("failed to bind AWS_SECRET_ACCESS_KEY: %w", err)
	}
	if err := viper.BindEnv("aws.bucket_name", "AWS_S3_BUCKET_NAME"); err != nil {
		return fmt.Errorf("failed to bind AWS_S3_BUCKET_NAME: %w", err)
	}
	if err := viper.BindEnv("aws.endpoint", "AWS_S3_ENDPOINT"); err != nil {
		return fmt.Errorf("failed to bind AWS_S3_ENDPOINT: %w", err)
	}

	// BCV
	if err := viper.BindEnv("bcv.url", "BCV_API_URL"); err != nil {
		return fmt.Errorf("failed to bind BCV_API_URL: %w", err)
	}

	// App
	if err := viper.BindEnv("app.env", "APP_ENV"); err != nil {
		return fmt.Errorf("failed to bind APP_ENV: %w", err)
	}
	if err := viper.BindEnv("app.debug", "APP_DEBUG"); err != nil {
		return fmt.Errorf("failed to bind APP_DEBUG: %w", err)
	}
	if err := viper.BindEnv("app.allowed_origins", "APP_ALLOWED_ORIGINS"); err != nil {
		return fmt.Errorf("failed to bind APP_ALLOWED_ORIGINS: %w", err)
	}

	return nil
}

// Load loads configuration from environment variables and .env file
func Load() (*Config, error) {
	var cfg Config

	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found (or error reading it), relying on existing environment")
	}

	viper.AutomaticEnv()

	if err := bindEnvVars(); err != nil {
		return nil, fmt.Errorf("failed to bind environment variables: %w", err)
	}

	if err := viper.ReadInConfig(); err == nil {
		log.Println("Using .env file for configuration")
	}

	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	return &cfg, nil
}

func (c *Config) IsProduction() bool {
	return c.App.Env == "production"
}

func (c *Config) IsDevelopment() bool {
	return c.App.Env == "development"
}
