package application

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	
	"github.com/edorguez/bolos-ya/internal/domain"
	apperrors "github.com/edorguez/bolos-ya/internal/pkg/errors"
)

// AuthService handles authentication and authorization logic
type AuthService struct {
	userRepo domain.UserRepository
	jwtSecret string
}

// NewAuthService creates a new AuthService
func NewAuthService(userRepo domain.UserRepository, jwtSecret string) *AuthService {
	return &AuthService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

// RegisterRequest contains registration data
type RegisterRequest struct {
	Email    string
	Password string
}

// Register creates a new user with email/password authentication
func (s *AuthService) Register(ctx context.Context, req RegisterRequest) (*domain.User, error) {
	// Check if user already exists
	existing, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err == nil && existing != nil {
		return nil, apperrors.ErrConflict
	}
	if err != nil && !errors.Is(err, apperrors.ErrNotFound) {
		return nil, err
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	hashedPasswordStr := string(hashedPassword)
	user := domain.NewUserWithPassword(req.Email, hashedPasswordStr)

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

// LoginRequest contains login credentials
type LoginRequest struct {
	Email    string
	Password string
}

// LoginResponse contains authentication tokens
type LoginResponse struct {
	AccessToken  string     `json:"accessToken"`
	RefreshToken string     `json:"refreshToken"`
	ExpiresIn    int64      `json:"expiresIn"`
	User         *domain.User `json:"user"`
}

// Login authenticates a user with email/password
func (s *AuthService) Login(ctx context.Context, req LoginRequest) (*LoginResponse, error) {
	// Find user by email
	user, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return nil, apperrors.ErrUnauthorized
		}
		return nil, err
	}

	// Verify password
	if user.PasswordHash == nil {
		return nil, apperrors.ErrUnauthorized
	}
	if err := bcrypt.CompareHashAndPassword([]byte(*user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, apperrors.ErrUnauthorized
	}

	// Generate tokens
	accessToken, err := s.generateAccessToken(user.ID.String())
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.generateRefreshToken(user.ID.String())
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    15 * 60, // 15 minutes in seconds
		User:         user,
	}, nil
}

// GoogleLoginRequest contains Google OAuth data
type GoogleLoginRequest struct {
	GoogleIDToken string
}

// LoginWithGoogle authenticates a user using Google OAuth
func (s *AuthService) LoginWithGoogle(ctx context.Context, req GoogleLoginRequest) (*LoginResponse, error) {
	// In a real implementation, we would verify the Google ID token
	// and extract user information from it
	// For now, this is a placeholder
	return nil, apperrors.ErrNotImplemented
}

// VerifyToken validates a JWT token and returns the user ID
func (s *AuthService) VerifyToken(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return "", err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if userID, ok := claims["sub"].(string); ok {
			return userID, nil
		}
	}

	return "", apperrors.ErrUnauthorized
}

// generateAccessToken creates a JWT access token
func (s *AuthService) generateAccessToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(15 * time.Minute).Unix(),
		"iat": time.Now().Unix(),
		"iss": "bolos-ya",
		"typ": "access",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

// generateRefreshToken creates a JWT refresh token
func (s *AuthService) generateRefreshToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(7 * 24 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
		"iss": "bolos-ya",
		"typ": "refresh",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}
