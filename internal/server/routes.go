package server

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	goredis "github.com/redis/go-redis/v9"

	"github.com/edorguez/merki/internal/server/handlers"
	internalmiddleware "github.com/edorguez/merki/internal/server/middleware"
	"github.com/edorguez/merki/internal/server/services"
	"github.com/edorguez/merki/pkg/logger"
	pkgmiddleware "github.com/edorguez/merki/pkg/middleware"
)

func SetupRoutes(
	authService services.AuthService,
	cartService services.CartService,
	syncService services.SyncService,
	paymentService services.PaymentService,
	rejectionReasonService services.RejectionReasonService,
	paymentStatusService services.PaymentStatusService,
	supermarketService services.SupermarketService,
	bcvRateService services.BCVRateService,
	betterAuthURL string,
	internalAuthSecret string,
	log *logger.Logger,
	redisClient goredis.Cmdable,
) *gin.Engine {
	router := gin.New()

	router.Use(gin.Recovery())
	router.Use(pkgmiddleware.LoggingMiddleware(log))
	router.Use(corsMiddleware())

	rateLimiter := pkgmiddleware.NewRateLimiter(100, 200)
	router.Use(rateLimiter.Middleware())

	authHandler := handlers.NewAuthHandler(authService, syncService)
	cartHandler := handlers.NewCartHandler(cartService)
	syncHandler := handlers.NewSyncHandler(syncService, log)
	paymentHandler := handlers.NewPaymentHandler(paymentService)
	rejectionReasonHandler := handlers.NewRejectionReasonHandler(rejectionReasonService)
	paymentStatusHandler := handlers.NewPaymentStatusHandler(paymentStatusService)
	supermarketHandler := handlers.NewSupermarketHandler(supermarketService)
	bcvRateHandler := handlers.NewBCVRateHandler(bcvRateService)

	authMiddleware := internalmiddleware.NewAuthMiddleware(authService, betterAuthURL, redisClient)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"timestamp": time.Now().Unix(),
		})
	})

	apiV1 := router.Group("/api/v1")
	{
		// Internal service-to-service endpoints (auth-server → Go). These are
		// reachable from the public internet, so they require a shared secret
		// instead of a user session.
		internalAuth := apiV1.Group("/auth/internal")
		internalAuth.Use(internalmiddleware.InternalAuthMiddleware(internalAuthSecret))
		{
			internalAuth.POST("/send-reset-password-email", authHandler.RequestPasswordReset)
		}

		protected := apiV1.Group("")
		protected.Use(authMiddleware.Handler())
		{
			protected.POST("/auth/sync", authHandler.SyncUser)
			protected.GET("/auth/me", authHandler.GetMe)

			cartsGroup := protected.Group("/carts")
			{
				cartsGroup.POST("", cartHandler.CreateCart)
				cartsGroup.GET("", cartHandler.GetCarts)
				cartsGroup.GET("/:cartId", cartHandler.GetCartDetail)
				cartsGroup.POST("/:cartId/checkout", cartHandler.CheckoutCart)
			}

			cartProductsGroup := protected.Group("/cart-products")
			{
				cartProductsGroup.POST("", cartHandler.AddProduct)
				cartProductsGroup.PUT("/:cartProductId", cartHandler.UpdateCartProduct)
				cartProductsGroup.PUT("/:cartProductId/quantity", cartHandler.UpdateProductQuantity)
				cartProductsGroup.DELETE("/:cartProductId", cartHandler.RemoveProduct)
			}

			syncGroup := protected.Group("/sync")
			{
				syncGroup.POST("", syncHandler.ProcessSync)
			}

			paymentsGroup := protected.Group("/payments")
			{
				paymentsGroup.POST("", paymentHandler.CreatePayment)
				paymentsGroup.GET("/:paymentId", paymentHandler.GetPaymentByID)

				adminPayments := paymentsGroup.Group("")
				adminPayments.Use(internalmiddleware.AdminRoleMiddleware())
				{
					adminPayments.GET("", paymentHandler.GetAllPayments)
					adminPayments.GET("/by-user/:userId", paymentHandler.GetPaymentsByUserID)
					adminPayments.GET("/by-email/:email", paymentHandler.GetPaymentsByEmail)
					adminPayments.PUT("/:paymentId", paymentHandler.UpdatePayment)
					adminPayments.DELETE("/:paymentId", paymentHandler.DeletePayment)
				}
			}

			adminEndpoints := protected.Group("")
			adminEndpoints.Use(internalmiddleware.AdminRoleMiddleware())
			{
				adminEndpoints.GET("/rejection-reasons", rejectionReasonHandler.GetAll)
				adminEndpoints.GET("/payment-statuses", paymentStatusHandler.GetAll)
			}

			supermarketsGroup := protected.Group("/supermarkets")
			{
				supermarketsGroup.POST("", supermarketHandler.CreateSupermarket)
				supermarketsGroup.GET("", supermarketHandler.GetAllSupermarkets)
				supermarketsGroup.GET("/:supermarketId", supermarketHandler.GetSupermarketByID)
			}

			protected.GET("/bcv-rates", bcvRateHandler.GetLatestRate)

			protected.POST("/auth/internal/migrate-user-data", authHandler.MigrateUserData)
		}

		apiV1.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "Merki API v1",
				"version": "1.0.0",
			})
		})
	}

	return router
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, X-User-ID, X-User-Email, X-Auth-Provider")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
