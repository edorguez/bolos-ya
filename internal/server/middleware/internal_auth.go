package middleware

import (
	"crypto/subtle"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/edorguez/merki/pkg/utils"
)

// InternalAuthMiddleware protects service-to-service endpoints with a shared
// secret. These endpoints are reachable from the public internet (the Go API is
// exposed via Caddy), so without this guard they would be an open email/spam
// relay. The secret is only shared with the auth-server via INTERNAL_API_KEY.
func InternalAuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		parts := strings.Split(authHeader, " ")

		if secret == "" || len(parts) != 2 || parts[0] != "Bearer" ||
			subtle.ConstantTimeCompare([]byte(parts[1]), []byte(secret)) != 1 {
			utils.UnauthorizedResponse(c)
			c.Abort()
			return
		}

		c.Next()
	}
}
