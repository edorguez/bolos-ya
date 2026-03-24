package server

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/edorguez/bolos-ya/internal/server/handlers"
	internalmiddleware "github.com/edorguez/bolos-ya/internal/server/middleware"
	"github.com/edorguez/bolos-ya/internal/server/services"
	"github.com/edorguez/bolos-ya/pkg/logger"
	pkgmiddleware "github.com/edorguez/bolos-ya/pkg/middleware"
)

// SetupRoutes creates and configures the Gin router with all routes
func SetupRoutes(
	authService services.AuthService,
	cartService services.CartService,
	syncService services.SyncService,
	priceConfidenceService services.PriceConfidenceService,
	log *logger.Logger,
) *gin.Engine {
	router := gin.New()

	// Middleware
	router.Use(gin.Recovery())
	router.Use(pkgmiddleware.LoggingMiddleware(log))
	router.Use(corsMiddleware())

	// Handlers
	authHandler := handlers.NewAuthHandler(authService)
	cartHandler := handlers.NewCartHandler(cartService)
	syncHandler := handlers.NewSyncHandler(syncService)

	// Auth middleware
	authMiddleware := internalmiddleware.NewAuthMiddleware(authService)

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"timestamp": time.Now().Unix(),
		})
	})

	// API v1 routes
	apiV1 := router.Group("/api/v1")
	{
		// Auth routes (no auth required)
		authGroup := apiV1.Group("/auth")
		{
			authGroup.POST("/register", authHandler.Register)
			authGroup.POST("/login", authHandler.Login)
			authGroup.POST("/google", authHandler.LoginWithGoogle)
		}

		// Protected routes
		protected := apiV1.Group("")
		protected.Use(authMiddleware.Handler())
		{
			// Cart routes
			cartsGroup := protected.Group("/carts")
			{
				cartsGroup.POST("", cartHandler.CreateCart)
				cartsGroup.GET("/:cartId/items", cartHandler.GetCartItems)
				cartsGroup.POST("/:cartId/checkout", cartHandler.CheckoutCart)
			}

			// Cart item routes
			cartItemsGroup := protected.Group("/cart-items")
			{
				cartItemsGroup.POST("", cartHandler.AddItem)
				cartItemsGroup.PUT("/:cartItemId", cartHandler.UpdateItemQuantity)
				cartItemsGroup.DELETE("/:cartItemId", cartHandler.RemoveItem)
			}

			// Sync routes
			syncGroup := protected.Group("/sync")
			{
				syncGroup.POST("", syncHandler.ProcessSync)
				syncGroup.POST("/mark-synced", syncHandler.MarkUserSynced)
			}
		}

		// Public routes (if any)
		apiV1.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "Bolos Ya API v1",
				"version": "1.0.0",
			})
		})
	}

	return router
}

// corsMiddleware provides basic CORS support
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
