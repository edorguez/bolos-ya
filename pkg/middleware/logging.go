package middleware

import (
	"time"

	"github.com/edorguez/bolos-ya/pkg/logger"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// LoggingMiddleware returns a Gin middleware that logs HTTP requests
func LoggingMiddleware(log *logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Start timer
		start := time.Now()

		// Process request
		c.Next()

		// Calculate latency
		latency := time.Since(start)

		// Log request details
		log.Info("HTTP request",
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.Int("status", c.Writer.Status()),
			zap.String("client_ip", c.ClientIP()),
			zap.String("user_agent", c.Request.UserAgent()),
			zap.Duration("latency", latency),
		)
	}
}
