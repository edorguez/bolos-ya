package middleware

import (
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"github.com/edorguez/bolos-ya/internal/server/services"
	"github.com/edorguez/bolos-ya/pkg/constants"
	"github.com/edorguez/bolos-ya/pkg/utils"
)

type AuthMiddleware struct {
	authService       services.AuthService
	internalAPIKey    string
	betterAuthSecret  string
}

func NewAuthMiddleware(authService services.AuthService, internalAPIKey, betterAuthSecret string) *AuthMiddleware {
	return &AuthMiddleware{
		authService:      authService,
		internalAPIKey:   internalAPIKey,
		betterAuthSecret: betterAuthSecret,
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
		sessionToken := c.GetHeader("X-Session-Token")

		if sessionToken != "" {
			validUserID, err := m.validateSessionJWT(sessionToken)
			if err != nil {
				utils.UnauthorizedResponse(c)
				c.Abort()
				return
			}

			if userID == "" {
				userID = validUserID
			} else if userID != validUserID {
				utils.UnauthorizedResponse(c)
				c.Abort()
				return
			}
		}

		if userID == "" {
			c.Set(constants.CtxUserIDKey, "")
			c.Next()
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

func (m *AuthMiddleware) validateSessionJWT(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(m.betterAuthSecret), nil
	})
	if err != nil || !token.Valid {
		return "", fmt.Errorf("invalid session token: %w", err)
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", fmt.Errorf("invalid JWT claims")
	}

	sub, ok := claims["sub"].(string)
	if !ok || sub == "" {
		return "", fmt.Errorf("missing sub claim in JWT")
	}

	return sub, nil
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