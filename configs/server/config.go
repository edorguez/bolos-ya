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
	AWS      AWSConfig
	BCV      BCVConfig
	App      AppConfig
	Auth     AuthConfig
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

// AuthConfig holds better-auth integration configuration
type AuthConfig struct {
	InternalAPIKey string `mapstructure:"internal_api_key"`
	BetterAuthURL  string `mapstructure:"better_auth_url"`
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

	// Auth (better-auth integration)
	if err := viper.BindEnv("auth.internal_api_key", "INTERNAL_API_KEY"); err != nil {
		return fmt.Errorf("failed to bind INTERNAL_API_KEY: %w", err)
	}
	if err := viper.BindEnv("auth.better_auth_url", "BETTER_AUTH_URL"); err != nil {
		return fmt.Errorf("failed to bind BETTER_AUTH_URL: %w", err)
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
