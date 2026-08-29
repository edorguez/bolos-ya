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

var templates = template.Must(template.New("email").Funcs(template.FuncMap{"dict": dict}).ParseFS(templatesFS, "templates/*.gohtml"))

// dict builds a map from key/value pairs for use with template partials.
// It mirrors the helper commonly used by template libraries: {{dict "k" "v"}}.
func dict(values ...any) (map[string]any, error) {
	if len(values)%2 != 0 {
		return nil, fmt.Errorf("dict: odd number of arguments")
	}
	d := make(map[string]any, len(values)/2)
	for i := 0; i < len(values); i += 2 {
		key, ok := values[i].(string)
		if !ok {
			return nil, fmt.Errorf("dict: key %v is not a string", values[i])
		}
		d[key] = values[i+1]
	}
	return d, nil
}

const (
	defaultAppURL       = "https://somosmerki.app"
	defaultImageBaseURL = "https://somosmerki.app"
	defaultSupportEmail = "soporte@somosmerki.app"
	defaultSupportPhone = "+58 412-XXX-XXXX"
)

type Config struct {
	ResendAPIKey string
	FromEmail    string
	FromName     string
	ImageBaseURL string
	AppURL       string
	SupportEmail string
	SupportPhone string
}

// baseData holds the fields shared by every template. Embed it in each
// template-specific data struct so the email layout has a single source
// of truth for branding and support contact information.
type baseData struct {
	Name         string
	Email        string
	AppURL       string
	ImageBaseURL string
	SupportEmail string
	SupportPhone string
}

type WelcomeData struct {
	baseData
}

type PaymentApprovedData struct {
	baseData
	PremiumUntil string
}

type PaymentRejectedData struct {
	baseData
	Reason        string
	CustomMessage string
}

type PasswordResetData struct {
	baseData
	ResetURL string
}

type Service interface {
	SendWelcome(ctx context.Context, to, name string) error
	SendPaymentApproved(ctx context.Context, to, name, premiumUntil string) error
	SendPaymentRejected(ctx context.Context, to, name, reason, customMessage string) error
	SendPasswordReset(ctx context.Context, to, name, resetURL string) error
}

type service struct {
	client    *resend.Client
	from      string
	fromEmail string
	cfg       Config
	log       *zap.Logger
}

func NewService(cfg Config, log *zap.Logger) Service {
	cfg.fillDefaults()
	return &service{
		client:    resend.NewClient(cfg.ResendAPIKey),
		from:      fmt.Sprintf("%s <%s>", cfg.FromName, cfg.FromEmail),
		fromEmail: cfg.FromEmail,
		cfg:       cfg,
		log:       log,
	}
}

func (c *Config) fillDefaults() {
	if c.AppURL == "" {
		c.AppURL = defaultAppURL
	}
	if c.ImageBaseURL == "" {
		c.ImageBaseURL = defaultImageBaseURL
	}
	if c.SupportEmail == "" {
		c.SupportEmail = defaultSupportEmail
	}
	if c.SupportPhone == "" {
		c.SupportPhone = defaultSupportPhone
	}
}

func (s *service) render(templateName string, data any) (string, error) {
	var buf bytes.Buffer
	if err := templates.ExecuteTemplate(&buf, templateName, data); err != nil {
		return "", fmt.Errorf("render %s template: %w", templateName, err)
	}
	return buf.String(), nil
}

func (s *service) SendWelcome(ctx context.Context, to, name string) error {
	html, err := s.render("welcome.gohtml", WelcomeData{
		baseData: s.base(to, name),
	})
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	params := &resend.SendEmailRequest{
		From:    s.from,
		To:      []string{to},
		Subject: "¡Bienvenido a Merki!",
		Html:    html,
	}

	if _, err := s.client.Emails.SendWithContext(ctx, params); err != nil {
		return fmt.Errorf("send welcome email via resend: %w", err)
	}

	s.log.Info("welcome email sent", zap.String("to", to))
	return nil
}

func (s *service) SendPasswordReset(ctx context.Context, to, name, resetURL string) error {
	html, err := s.render("reset-password.gohtml", PasswordResetData{
		baseData: s.base(to, name),
		ResetURL: resetURL,
	})
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	params := &resend.SendEmailRequest{
		From:    s.from,
		To:      []string{to},
		Subject: "Restablece tu contraseña en Merki",
		Html:    html,
	}

	if _, err := s.client.Emails.SendWithContext(ctx, params); err != nil {
		return fmt.Errorf("send reset password email via resend: %w", err)
	}

	s.log.Info("reset password email sent", zap.String("to", to))
	return nil
}

func (s *service) SendPaymentApproved(ctx context.Context, to, name, premiumUntil string) error {
	html, err := s.render("approved.gohtml", PaymentApprovedData{
		baseData:     s.base(to, name),
		PremiumUntil: premiumUntil,
	})
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	params := &resend.SendEmailRequest{
		From:    s.from,
		To:      []string{to},
		Subject: "¡Pago aprobado! Ya eres premium",
		Html:    html,
	}

	if _, err := s.client.Emails.SendWithContext(ctx, params); err != nil {
		return fmt.Errorf("send approved email via resend: %w", err)
	}

	s.log.Info("payment approved email sent", zap.String("to", to))
	return nil
}

func (s *service) SendPaymentRejected(ctx context.Context, to, name, reason, customMessage string) error {
	html, err := s.render("rejected.gohtml", PaymentRejectedData{
		baseData:      s.base(to, name),
		Reason:        reason,
		CustomMessage: customMessage,
	})
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	params := &resend.SendEmailRequest{
		From:    s.from,
		To:      []string{to},
		Subject: "No pudimos procesar tu pago",
		Html:    html,
	}

	if _, err := s.client.Emails.SendWithContext(ctx, params); err != nil {
		return fmt.Errorf("send rejected email via resend: %w", err)
	}

	s.log.Info("payment rejected email sent", zap.String("to", to))
	return nil
}

// base builds the shared branding fields for a template data struct.
func (s *service) base(to, name string) baseData {
	return baseData{
		Name:         name,
		Email:        to,
		AppURL:       s.cfg.AppURL,
		ImageBaseURL: s.cfg.ImageBaseURL,
		SupportEmail: s.cfg.SupportEmail,
		SupportPhone: s.cfg.SupportPhone,
	}
}
