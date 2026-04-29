package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/edorguez/bolos-ya/internal/server/services"
	"github.com/edorguez/bolos-ya/pkg/constants"
	"github.com/edorguez/bolos-ya/pkg/utils"
)

type AuthMiddleware struct {
	authService  services.AuthService
	internalAPIKey string
}

func NewAuthMiddleware(authService services.AuthService, internalAPIKey string) *AuthMiddleware {
	return &AuthMiddleware{
		authService:  authService,
		internalAPIKey: internalAPIKey,
	}
}

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

		if parts[1] != m.internalAPIKey {
			utils.UnauthorizedResponse(c)
			c.Abort()
			return
		}

		userID := c.GetHeader(constants.UserIDHeader)
		if userID == "" {
			utils.UnauthorizedResponse(c)
			c.Abort()
			return
		}

		userEmail := c.GetHeader(constants.UserEmailHeader)
		authProvider := c.GetHeader(constants.UserProviderHeader)

		user, err := m.authService.GetOrCreateUserFromHeaders(c.Request.Context(), userID, userEmail, authProvider)
		if err != nil {
			utils.InternalErrorResponse(c)
			c.Abort()
			return
		}

		c.Set(constants.CtxUserIDKey, user.ID.String())
		c.Set(constants.CtxUserKey, user)
		c.Next()
	}
}

func GetUserIDFromContext(c *gin.Context) (string, bool) {
	userID, exists := c.Get(constants.CtxUserIDKey)
	if !exists {
		return "", false
	}
	return userID.(string), true
}

func GetUserFromContext(c *gin.Context) (any, bool) {
	user, exists := c.Get(constants.CtxUserKey)
	if !exists {
		return nil, false
	}
	return user, true
}