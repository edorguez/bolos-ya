package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/edorguez/bolos-ya/internal/server/services"
	"github.com/edorguez/bolos-ya/pkg/utils"
)

// AuthMiddleware provides JWT authentication middleware
type AuthMiddleware struct {
	authService services.AuthService
}

// NewAuthMiddleware creates a new AuthMiddleware
func NewAuthMiddleware(authService services.AuthService) *AuthMiddleware {
	return &AuthMiddleware{
		authService: authService,
	}
}

// Handler returns the Gin middleware handler
func (m *AuthMiddleware) Handler() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.UnauthorizedResponse(c)
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			utils.UnauthorizedResponse(c)
			c.Abort()
			return
		}

		token := parts[1]
		userID, err := m.authService.VerifyToken(token)
		if err != nil {
			utils.UnauthorizedResponse(c)
			c.Abort()
			return
		}

		// Store userID in context for handlers to use
		c.Set("userID", userID)
		c.Next()
	}
}

// GetUserIDFromContext extracts user ID from Gin context
func GetUserIDFromContext(c *gin.Context) (string, bool) {
	userID, exists := c.Get("userID")
	if !exists {
		return "", false
	}
	return userID.(string), true
}
