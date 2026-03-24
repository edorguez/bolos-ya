package main

import (
	"log"
	"strconv"

	redisv8 "github.com/go-redis/redis/v8"
	"go.uber.org/zap"
	"gorm.io/gorm"

	serverconfig "github.com/edorguez/bolos-ya/configs/server"
	"github.com/edorguez/bolos-ya/internal/server"
	"github.com/edorguez/bolos-ya/internal/server/models"
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
		URL:          cfg.Database.URL,
		MaxOpenConns: cfg.Database.MaxOpenConns,
		MaxIdleConns: cfg.Database.MaxIdleConns,
	})
	if err != nil {
		logger.Fatal("Failed to connect to PostgreSQL", zap.Error(err))
	}

	// Auto-migrate models
	if err := autoMigrate(db); err != nil {
		logger.Fatal("Failed to auto-migrate database", zap.Error(err))
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
	priceRepo := repository.NewPriceRepository(db)
	cartRepo := repository.NewCartRepository(db)
	cartItemRepo := repository.NewCartItemRepository(db)

	// Initialize services
	authService := services.NewAuthService(userRepo, cfg.JWT.Secret)
	cartService := services.NewCartService(cartRepo, cartItemRepo, productRepo, priceRepo)
	syncService := services.NewSyncService(userRepo, cartRepo, cartItemRepo, productRepo, priceRepo, supermarketRepo)
	priceConfidenceService := services.NewPriceConfidenceService(priceRepo)

	// Setup Gin router
	router := server.SetupRoutes(
		authService,
		cartService,
		syncService,
		priceConfidenceService,
		logger,
	)

	// Start server
	addr := cfg.Server.Host + ":" + strconv.Itoa(cfg.Server.Port)
	logger.Info("Starting server", zap.String("addr", addr))
	if err := router.Run(addr); err != nil {
		logger.Fatal("Failed to start server", zap.Error(err))
	}
}

// autoMigrate runs GORM auto-migration for all models
func autoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.Supermarket{},
		&models.Product{},
		&models.Price{},
		&models.Cart{},
		&models.CartItem{},
		&models.Config{},
	)
}
