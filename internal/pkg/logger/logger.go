package logger

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Logger is a wrapper around zap.Logger for convenience
type Logger struct {
	*zap.Logger
}

// New creates a new logger based on environment
func New(debug bool) *Logger {
	var config zap.Config
	if debug {
		config = zap.NewDevelopmentConfig()
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	} else {
		config = zap.NewProductionConfig()
		config.EncoderConfig.TimeKey = "timestamp"
		config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	}

	// Add caller info in development
	config.DisableCaller = !debug
	config.DisableStacktrace = !debug

	// Build logger
	zapLogger, err := config.Build()
	if err != nil {
		// Fallback to a simple logger
		fallback := zap.NewExample()
		return &Logger{fallback}
	}

	return &Logger{zapLogger}
}

// NewDefault creates a logger with default settings (development mode)
func NewDefault() *Logger {
	return New(true)
}

// Sync flushes any buffered log entries
func (l *Logger) Sync() error {
	return l.Logger.Sync()
}

// WithField adds a field to the logger
func (l *Logger) WithField(key string, value interface{}) *Logger {
	field := zap.Any(key, value)
	return &Logger{l.Logger.With(field)}
}

// WithFields adds multiple fields to the logger
func (l *Logger) WithFields(fields map[string]interface{}) *Logger {
	zapFields := make([]zap.Field, 0, len(fields))
	for k, v := range fields {
		zapFields = append(zapFields, zap.Any(k, v))
	}
	return &Logger{l.Logger.With(zapFields...)}
}

// StdLogger returns a standard library logger that writes to this logger at InfoLevel
func (l *Logger) StdLogger() *zap.Logger {
	return l.Logger
}

// Helper functions for common log levels with structured fields
func (l *Logger) Debug(msg string, fields ...zap.Field) {
	l.Logger.Debug(msg, fields...)
}

func (l *Logger) Info(msg string, fields ...zap.Field) {
	l.Logger.Info(msg, fields...)
}

func (l *Logger) Warn(msg string, fields ...zap.Field) {
	l.Logger.Warn(msg, fields...)
}

func (l *Logger) Error(msg string, fields ...zap.Field) {
	l.Logger.Error(msg, fields...)
}

func (l *Logger) Fatal(msg string, fields ...zap.Field) {
	l.Logger.Fatal(msg, fields...)
}
