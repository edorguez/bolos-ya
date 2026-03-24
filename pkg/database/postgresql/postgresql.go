package postgresql

import (
	"fmt"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Config holds PostgreSQL connection configuration
type Config struct {
	URL          string
	MaxOpenConns int
	MaxIdleConns int
}

// Connect establishes a connection to PostgreSQL using GORM
func Connect(cfg Config) (*gorm.DB, error) {
	// Parse connection string and open database
	db, err := gorm.Open(postgres.Open(cfg.URL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent), // Disable GORM logs by default
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to PostgreSQL: %w", err)
	}

	// Get underlying sql.DB to configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying SQL DB: %w", err)
	}

	// Set connection pool settings
	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)
	sqlDB.SetConnMaxIdleTime(10 * time.Minute)

	// Test connection
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping PostgreSQL: %w", err)
	}

	return db, nil
}
