package utils

import (
	"golang.org/x/crypto/bcrypt"
)

// HashPassword creates a bcrypt hash of the password
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// CheckPasswordHash compares a bcrypt hashed password with its plaintext version
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// IsPasswordHashValid checks if a hash looks like a valid bcrypt hash
func IsPasswordHashValid(hash string) bool {
	// Basic check: bcrypt hash starts with "$2a$", "$2b$", "$2y$"
	if len(hash) < 60 {
		return false
	}
	return hash[0] == '$' && (hash[1] == '2') && (hash[2] == 'a' || hash[2] == 'b' || hash[2] == 'y')
}
