package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/edorguez/bolos-ya/internal/server/services"
	"github.com/edorguez/bolos-ya/pkg/constants"
	"github.com/edorguez/bolos-ya/pkg/utils"
)

type AuthMiddleware struct {
	authService    services.AuthService
	betterAuthURL  string
}

func NewAuthMiddleware(authService services.AuthService, betterAuthURL string) *AuthMiddleware {
	return &AuthMiddleware{
		authService:   authService,
		betterAuthURL: betterAuthURL,
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

		betterAuthUserID, isAnonymous, err := m.validateSessionAndGetIsAnonymous(c.Request.Context(), parts[1])
		if err != nil {
			utils.UnauthorizedResponse(c)
			c.Abort()
			return
		}

		userEmail := c.GetHeader(constants.UserEmailHeader)
		authProvider := c.GetHeader(constants.UserProviderHeader)

		user, err := m.authService.GetOrCreateUserFromHeaders(c.Request.Context(), betterAuthUserID, userEmail, authProvider, isAnonymous)
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

func (m *AuthMiddleware) validateSessionAndGetIsAnonymous(ctx context.Context, token string) (string, bool, error) {
	url := m.betterAuthURL + "/api/auth/get-session"
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return "", false, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Cookie", "better-auth.session_token="+token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", false, fmt.Errorf("failed to call auth server: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", false, fmt.Errorf("auth server returned status %d", resp.StatusCode)
	}

	var result struct {
		User struct {
			ID          string `json:"id"`
			IsAnonymous bool   `json:"isAnonymous"`
		} `json:"user"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", false, fmt.Errorf("failed to decode auth server response: %w", err)
	}

	if result.User.ID == "" {
		return "", false, fmt.Errorf("empty user ID in auth server response")
	}

	return result.User.ID, result.User.IsAnonymous, nil
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
