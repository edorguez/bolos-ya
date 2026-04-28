package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/edorguez/bolos-ya/internal/server/models"
	"github.com/edorguez/bolos-ya/internal/server/repository"
	"github.com/edorguez/bolos-ya/pkg/constants"
	apperrors "github.com/edorguez/bolos-ya/pkg/core/errors"
	"github.com/edorguez/bolos-ya/pkg/utils"
)

type AuthMiddleware struct {
	userRepo       repository.UserRepository
	internalAPIKey string
}

func NewAuthMiddleware(userRepo repository.UserRepository, internalAPIKey string) *AuthMiddleware {
	return &AuthMiddleware{
		userRepo:       userRepo,
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

		user, err := m.userRepo.FindByBetterAuthUserID(c.Request.Context(), userID)
		if err != nil {
			if err != apperrors.ErrNotFound {
				utils.InternalErrorResponse(c)
				c.Abort()
				return
			}

			if userEmail == "" {
				utils.UnauthorizedResponse(c)
				c.Abort()
				return
			}

			provider := authProvider
			if provider == "" {
				provider = constants.AuthProviderEmail
			}

			user = models.NewUserFromBetterAuth(userID, userEmail, provider)
			if err := m.userRepo.Create(c.Request.Context(), user); err != nil {
				utils.InternalErrorResponse(c)
				c.Abort()
				return
			}
		} else if userEmail != "" && user.Email != userEmail {
			user.Email = userEmail
			if authProvider != "" {
				user.AuthProvider = authProvider
			}
			_ = m.userRepo.Update(c.Request.Context(), user)
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

// GetUserFromContext extracts the full User model from Gin context
func GetUserFromContext(c *gin.Context) (*models.User, bool) {
	user, exists := c.Get(constants.CtxUserKey)
	if !exists {
		return nil, false
	}
	return user.(*models.User), true
}
