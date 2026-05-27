package main

import (
	"strconv"

	redisv8 "github.com/go-redis/redis/v8"
	"go.uber.org/zap"

	serverconfig "github.com/edorguez/bolos-ya/configs/server"
	"github.com/edorguez/bolos-ya/internal/server"
	"github.com/edorguez/bolos-ya/internal/server/email"
	"github.com/edorguez/bolos-ya/internal/server/repository"
	"github.com/edorguez/bolos-ya/internal/server/services"
	"github.com/edorguez/bolos-ya/pkg/database/postgresql"
	"github.com/edorguez/bolos-ya/pkg/database/redis"
	"github.com/edorguez/bolos-ya/pkg/logger"
)

func main() {
	cfg, err := serverconfig.Load()
	if err != nil {
		logger.New(false).Fatal("Failed to load config", zap.Error(err))
	}

	log := logger.New(cfg.App.Debug)

	db, err := postgresql.Connect(postgresql.Config{
		URL: cfg.Database.URL,
	})
	if err != nil {
		log.Fatal("Failed to connect to PostgreSQL", zap.Error(err))
	}

	var redisClient *redisv8.Client
	if cfg.Redis.URL != "" {
		redisClient, err = redis.Connect(redis.Config{
			URL:      cfg.Redis.URL,
			Password: cfg.Redis.Password,
			DB:       cfg.Redis.DB,
		})
		if err != nil {
			log.Fatal("Failed to connect to Redis", zap.Error(err))
		}
		defer redis.Close(redisClient)
	}

	userRepo := repository.NewUserRepository(db)
	supermarketRepo := repository.NewSupermarketRepository(db)
	productRepo := repository.NewProductRepository(db)
	cartRepo := repository.NewCartRepository(db)
	cartProductRepo := repository.NewCartProductRepository(db)
	paymentRepo := repository.NewPaymentRepository(db)
	rejectionReasonRepo := repository.NewRejectionReasonRepository(db)
	paymentStatusRepo := repository.NewPaymentStatusRepository(db)

	emailSvc := email.NewService(email.Config{
		ResendAPIKey: cfg.Email.ResendAPIKey,
		FromEmail:    cfg.Email.FromEmail,
		FromName:     cfg.Email.FromName,
	}, log.Logger)

	authService := services.NewAuthService(userRepo, emailSvc, log.Logger)
	cartService := services.NewCartService(cartRepo, cartProductRepo, productRepo, supermarketRepo)
	syncService := services.NewSyncService(userRepo, cartRepo, cartProductRepo, productRepo, supermarketRepo)
	paymentService := services.NewPaymentService(paymentRepo)
	rejectionReasonService := services.NewRejectionReasonService(rejectionReasonRepo)
	paymentStatusService := services.NewPaymentStatusService(paymentStatusRepo)
	supermarketService := services.NewSupermarketService(supermarketRepo)

	router := server.SetupRoutes(
		authService,
		cartService,
		syncService,
		paymentService,
		rejectionReasonService,
		paymentStatusService,
		supermarketService,
		cfg.Auth.BetterAuthURL,
		log,
	)

	addr := cfg.Server.Host + ":" + strconv.Itoa(cfg.Server.Port)
	log.Info("Starting server", zap.String("addr", addr))
	if err := router.Run(addr); err != nil {
		log.Fatal("Failed to start server", zap.Error(err))
	}
}
