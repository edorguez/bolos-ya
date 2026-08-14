package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	goredis "github.com/redis/go-redis/v9"
	"go.uber.org/zap"

	serverconfig "github.com/edorguez/merki/configs/server"
	"github.com/edorguez/merki/internal/cron"
	"github.com/edorguez/merki/internal/server"
	"github.com/edorguez/merki/internal/server/email"
	"github.com/edorguez/merki/internal/server/repository"
	"github.com/edorguez/merki/internal/server/services"
	"github.com/edorguez/merki/pkg/database/postgresql"
	pkgredis "github.com/edorguez/merki/pkg/database/redis"
	"github.com/edorguez/merki/pkg/logger"
)

func main() {
	cfg, err := serverconfig.Load()
	if err != nil {
		logger.New(false).Fatal("Failed to load config", zap.Error(err))
	}

	log := logger.New(cfg.App.Debug)

	db, err := postgresql.Connect(postgresql.Config{
		URL:          cfg.Database.URL,
		MaxOpenConns: 25,
		MaxIdleConns: 10,
	})
	if err != nil {
		log.Fatal("Failed to connect to PostgreSQL", zap.Error(err))
	}

	var redisClient goredis.UniversalClient
	if cfg.Redis.URL != "" {
		redisClient, err = pkgredis.Connect(pkgredis.Config{
			URL:      cfg.Redis.URL,
			Password: cfg.Redis.Password,
			DB:       cfg.Redis.DB,
		})
		if err != nil {
			log.Fatal("Failed to connect to Redis", zap.Error(err))
		}
		defer pkgredis.Close(redisClient)
	}

	userRepo := repository.NewUserRepository(db)
	supermarketRepo := repository.NewSupermarketRepository(db)
	productRepo := repository.NewProductRepository(db)
	cartRepo := repository.NewCartRepository(db)
	cartProductRepo := repository.NewCartProductRepository(db)
	paymentRepo := repository.NewPaymentRepository(db)
	rejectionReasonRepo := repository.NewRejectionReasonRepository(db)
	paymentStatusRepo := repository.NewPaymentStatusRepository(db)
	bcvRateRepo := repository.NewBCVRateRepository(db)

	emailSvc := email.NewService(email.Config{
		ResendAPIKey: cfg.Email.ResendAPIKey,
		FromEmail:    cfg.Email.FromEmail,
		FromName:     cfg.Email.FromName,
	}, log.Logger)

	authService := services.NewAuthService(userRepo, emailSvc, log.Logger, cfg.Auth.BetterAuthURL)
	cartService := services.NewCartService(cartRepo, cartProductRepo, productRepo, supermarketRepo)
	syncService := services.NewSyncService(userRepo, cartRepo, cartProductRepo, productRepo, supermarketRepo)
	paymentService := services.NewPaymentService(paymentRepo, paymentStatusRepo, userRepo, authService, emailSvc, rejectionReasonRepo, log.Logger)
	rejectionReasonService := services.NewRejectionReasonService(rejectionReasonRepo)
	paymentStatusService := services.NewPaymentStatusService(paymentStatusRepo)
	supermarketService := services.NewSupermarketService(supermarketRepo)
	bcvRateService := services.NewBCVRateService(bcvRateRepo, log.Logger)

	go cron.StartBCVRateCron(bcvRateService, log.Logger)

	router := server.SetupRoutes(
		authService,
		cartService,
		syncService,
		paymentService,
		rejectionReasonService,
		paymentStatusService,
		supermarketService,
		bcvRateService,
		cfg.Auth.BetterAuthURL,
		log,
		redisClient,
	)

	addr := cfg.Server.Host + ":" + strconv.Itoa(cfg.Server.Port)
	srv := &http.Server{
		Addr:    addr,
		Handler: router,
	}

	go func() {
		log.Info("Starting server", zap.String("addr", addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown", zap.Error(err))
	}

	log.Info("Server exited")
}
