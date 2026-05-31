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

//go:embed templates/*.gohtml
var templatesFS embed.FS

var templates = template.Must(template.ParseFS(templatesFS, "templates/*.gohtml"))

const defaultSupportPhone = "+58 412-XXX-XXXX"

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

type PaymentApprovedData struct {
	Name         string
	Email        string
	PremiumUntil string
	SupportEmail string
}

type PaymentRejectedData struct {
	Name          string
	Email         string
	Reason        string
	CustomMessage string
	SupportEmail  string
	SupportPhone  string
}

type Service interface {
	SendWelcome(ctx context.Context, to, name string) error
	SendPaymentApproved(ctx context.Context, to, name, premiumUntil string) error
	SendPaymentRejected(ctx context.Context, to, name, reason, customMessage string) error
}

type service struct {
	client    *resend.Client
	from      string
	fromEmail string
	log       *zap.Logger
}

func NewService(cfg Config, log *zap.Logger) Service {
	return &service{
		client:    resend.NewClient(cfg.ResendAPIKey),
		from:      fmt.Sprintf("%s <%s>", cfg.FromName, cfg.FromEmail),
		fromEmail: cfg.FromEmail,
		log:       log,
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

func (s *service) SendPaymentApproved(ctx context.Context, to, name, premiumUntil string) error {
	var buf bytes.Buffer
	if err := templates.ExecuteTemplate(&buf, "approved.gohtml", PaymentApprovedData{
		Name:         name,
		Email:        to,
		PremiumUntil: premiumUntil,
		SupportEmail: s.fromEmail,
	}); err != nil {
		return fmt.Errorf("render approved template: %w", err)
	}

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	params := &resend.SendEmailRequest{
		From:    s.from,
		To:      []string{to},
		Subject: "¡Pago aprobado! Ya eres premium",
		Html:    buf.String(),
	}

	if _, err := s.client.Emails.SendWithContext(ctx, params); err != nil {
		return fmt.Errorf("send approved email via resend: %w", err)
	}

	s.log.Info("payment approved email sent", zap.String("to", to))
	return nil
}

func (s *service) SendPaymentRejected(ctx context.Context, to, name, reason, customMessage string) error {
	var buf bytes.Buffer
	if err := templates.ExecuteTemplate(&buf, "rejected.gohtml", PaymentRejectedData{
		Name:          name,
		Email:         to,
		Reason:        reason,
		CustomMessage: customMessage,
		SupportEmail:  s.fromEmail,
		SupportPhone:  defaultSupportPhone,
	}); err != nil {
		return fmt.Errorf("render rejected template: %w", err)
	}

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	params := &resend.SendEmailRequest{
		From:    s.from,
		To:      []string{to},
		Subject: "No pudimos procesar tu pago",
		Html:    buf.String(),
	}

	if _, err := s.client.Emails.SendWithContext(ctx, params); err != nil {
		return fmt.Errorf("send rejected email via resend: %w", err)
	}

	s.log.Info("payment rejected email sent", zap.String("to", to))
	return nil
}
