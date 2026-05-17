package email

import (
	"bytes"
	"context"
	"embed"
	"fmt"
	"html/template"
	"time"

	"github.com/resend/resend-go/v3"

	"go.uber.org/zap"
)

//go:embed templates/*
var templatesFS embed.FS

var templates = template.Must(template.ParseFS(templatesFS, "templates/*.gohtml"))

type Config struct {
	ResendAPIKey string
	FromEmail    string
	FromName     string
}

type WelcomeData struct {
	Name   string
	Email  string
	AppURL string
}

type Service interface {
	SendWelcome(ctx context.Context, to, name string) error
}

type service struct {
	client *resend.Client
	from   string
	log    *zap.Logger
}

func NewService(cfg Config, log *zap.Logger) Service {
	return &service{
		client: resend.NewClient(cfg.ResendAPIKey),
		from:   fmt.Sprintf("%s <%s>", cfg.FromName, cfg.FromEmail),
		log:    log,
	}
}

func (s *service) SendWelcome(ctx context.Context, to, name string) error {
	var buf bytes.Buffer
	if err := templates.ExecuteTemplate(&buf, "welcome.gohtml", WelcomeData{
		Name:   name,
		Email:  to,
		AppURL: "https://bolosya.app",
	}); err != nil {
		return fmt.Errorf("render welcome template: %w", err)
	}

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	params := &resend.SendEmailRequest{
		From:    s.from,
		To:      []string{to},
		Subject: "¡Bienvenido a Bolos Ya!",
		Html:    buf.String(),
	}

	if _, err := s.client.Emails.SendWithContext(ctx, params); err != nil {
		return fmt.Errorf("send welcome email via resend: %w", err)
	}

	s.log.Info("welcome email sent", zap.String("to", to))
	return nil
}
