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

func SetupRoutes(
	authService services.AuthService,
	cartService services.CartService,
	syncService services.SyncService,
	paymentService services.PaymentService,
	rejectionReasonService services.RejectionReasonService,
	paymentStatusService services.PaymentStatusService,
	supermarketService services.SupermarketService,
	betterAuthURL string,
	log *logger.Logger,
) *gin.Engine {
	router := gin.New()

	router.Use(gin.Recovery())
	router.Use(pkgmiddleware.LoggingMiddleware(log))
	router.Use(corsMiddleware())

	authHandler := handlers.NewAuthHandler(authService)
	cartHandler := handlers.NewCartHandler(cartService)
	syncHandler := handlers.NewSyncHandler(syncService)
	paymentHandler := handlers.NewPaymentHandler(paymentService)
	rejectionReasonHandler := handlers.NewRejectionReasonHandler(rejectionReasonService)
	paymentStatusHandler := handlers.NewPaymentStatusHandler(paymentStatusService)
	supermarketHandler := handlers.NewSupermarketHandler(supermarketService)

	authMiddleware := internalmiddleware.NewAuthMiddleware(authService, betterAuthURL)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"timestamp": time.Now().Unix(),
		})
	})

	apiV1 := router.Group("/api/v1")
	{
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
				paymentsGroup.GET("", paymentHandler.GetAllPayments)
				paymentsGroup.GET("/:paymentId", paymentHandler.GetPaymentByID)
				paymentsGroup.GET("/by-user/:userId", paymentHandler.GetPaymentsByUserID)
				paymentsGroup.GET("/by-email/:email", paymentHandler.GetPaymentsByEmail)
				paymentsGroup.PUT("/:paymentId", paymentHandler.UpdatePayment)
				paymentsGroup.DELETE("/:paymentId", paymentHandler.DeletePayment)
			}

			protected.GET("/rejection-reasons", rejectionReasonHandler.GetAll)
			protected.GET("/payment-statuses", paymentStatusHandler.GetAll)

			supermarketsGroup := protected.Group("/supermarkets")
			{
				supermarketsGroup.POST("", supermarketHandler.CreateSupermarket)
				supermarketsGroup.GET("", supermarketHandler.GetAllSupermarkets)
				supermarketsGroup.GET("/:supermarketId", supermarketHandler.GetSupermarketByID)
			}

		}

		apiV1.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "Bolos Ya API v1",
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
