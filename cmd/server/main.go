package main

import (
	"log"
	"strconv"

	redisv8 "github.com/go-redis/redis/v8"
	"go.uber.org/zap"

	serverconfig "github.com/edorguez/bolos-ya/configs/server"
	"github.com/edorguez/bolos-ya/internal/server"
	"github.com/edorguez/bolos-ya/internal/server/repository"
	"github.com/edorguez/bolos-ya/internal/server/services"
	"github.com/edorguez/bolos-ya/pkg/database/postgresql"
	"github.com/edorguez/bolos-ya/pkg/database/redis"
	"github.com/edorguez/bolos-ya/pkg/logger"
)

func main() {
	// Load configuration
	cfg, err := serverconfig.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize logger
	logger := logger.New(cfg.App.Debug)

	// Connect to PostgreSQL
	db, err := postgresql.Connect(postgresql.Config{
		URL: cfg.Database.URL,
	})
	if err != nil {
		logger.Fatal("Failed to connect to PostgreSQL", zap.Error(err))
	}

	// Connect to Redis (optional)
	var redisClient *redisv8.Client
	if cfg.Redis.URL != "" {
		redisClient, err = redis.Connect(redis.Config{
			URL:      cfg.Redis.URL,
			Password: cfg.Redis.Password,
			DB:       cfg.Redis.DB,
		})
		if err != nil {
			logger.Fatal("Failed to connect to Redis", zap.Error(err))
		}
		defer redis.Close(redisClient)
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	supermarketRepo := repository.NewSupermarketRepository(db)
	productRepo := repository.NewProductRepository(db)
	cartRepo := repository.NewCartRepository(db)
	cartProductRepo := repository.NewCartProductRepository(db)

	// Initialize services
	authService := services.NewAuthService(userRepo, cfg.JWT.Secret)
	cartService := services.NewCartService(cartRepo, cartProductRepo, productRepo)
	syncService := services.NewSyncService(userRepo, cartRepo, cartProductRepo, productRepo, supermarketRepo)

	// Setup Gin router
	router := server.SetupRoutes(
		authService,
		cartService,
		syncService,
		logger,
	)

	// Start server
	addr := cfg.Server.Host + ":" + strconv.Itoa(cfg.Server.Port)
	logger.Info("Starting server", zap.String("addr", addr))
	if err := router.Run(addr); err != nil {
		logger.Fatal("Failed to start server", zap.Error(err))
	}
}
