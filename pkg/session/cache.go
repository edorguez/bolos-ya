package session

import (
	"context"
	"crypto/sha256"
	"fmt"

	goredis "github.com/redis/go-redis/v9"
)

// CacheKey derives the Redis key under which a validated better-auth session
// token is cached. It must stay in sync with the auth middleware lookup.
func CacheKey(token string) string {
	h := sha256.Sum256([]byte(token))
	return fmt.Sprintf("session:%x", h[:16])
}

// Delete removes a token's cached session so a deleted account cannot be
// resurrected by the auth middleware within the remaining cache TTL.
func Delete(ctx context.Context, redisClient goredis.Cmdable, token string) error {
	if redisClient == nil {
		return nil
	}
	return redisClient.Del(ctx, CacheKey(token)).Err()
}
