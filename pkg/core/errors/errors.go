package errors

import "errors"

// Common application errors
var (
	ErrNotFound       = errors.New("resource not found")
	ErrConflict       = errors.New("resource conflict")
	ErrInvalidInput   = errors.New("invalid input")
	ErrUnauthorized   = errors.New("unauthorized")
	ErrForbidden      = errors.New("forbidden")
	ErrInternal       = errors.New("internal server error")
	ErrNotImplemented = errors.New("not implemented")
)
