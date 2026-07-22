package redis

import (
	"context"
	"fmt"
	"time"

	goredis "github.com/redis/go-redis/v9"
)

// Config holds Redis connection configuration
type Config struct {
	URL      string
	Password string
	DB       int
}

// Connect establishes a connection to Redis
func Connect(cfg Config) (goredis.UniversalClient, error) {
	opts, err := goredis.ParseURL(cfg.URL)
	if err != nil {
		// If URL parsing fails, try manual configuration
		opts = &goredis.Options{
			Addr:     cfg.URL,
			Password: cfg.Password,
			DB:       cfg.DB,
		}
	}

	client := goredis.NewClient(opts)

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return client, nil
}

// Close gracefully closes the Redis connection
func Close(client goredis.UniversalClient) error {
	if client == nil {
		return nil
	}
	return client.Close()
}
