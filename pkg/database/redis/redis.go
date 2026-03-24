package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
)

// Config holds Redis connection configuration
type Config struct {
	URL      string
	Password string
	DB       int
}

// Connect establishes a connection to Redis
func Connect(cfg Config) (*redis.Client, error) {
	opts, err := redis.ParseURL(cfg.URL)
	if err != nil {
		// If URL parsing fails, try manual configuration
		opts = &redis.Options{
			Addr:     cfg.URL,
			Password: cfg.Password,
			DB:       cfg.DB,
		}
	}

	client := redis.NewClient(opts)

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return client, nil
}

// Close gracefully closes the Redis connection
func Close(client *redis.Client) error {
	if client == nil {
		return nil
	}
	return client.Close()
}
