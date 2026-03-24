package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// JSONResponse sends a JSON response with status code
func JSONResponse(c *gin.Context, status int, data interface{}) {
	c.JSON(status, data)
}

// SuccessResponse sends a success JSON response
func SuccessResponse(c *gin.Context, data interface{}) {
	JSONResponse(c, http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}

// ErrorResponse sends an error JSON response
func ErrorResponse(c *gin.Context, status int, message string, details ...interface{}) {
	response := gin.H{
		"success": false,
		"error":   message,
	}
	if len(details) > 0 {
		response["details"] = details[0]
	}
	JSONResponse(c, status, response)
}

// ValidationError sends a validation error response
func ValidationError(c *gin.Context, errors map[string]string) {
	ErrorResponse(c, http.StatusBadRequest, "validation failed", errors)
}

// NotFoundResponse sends a not found error response
func NotFoundResponse(c *gin.Context, resource string) {
	ErrorResponse(c, http.StatusNotFound, resource+" not found")
}

// UnauthorizedResponse sends an unauthorized error response
func UnauthorizedResponse(c *gin.Context) {
	ErrorResponse(c, http.StatusUnauthorized, "unauthorized")
}

// ForbiddenResponse sends a forbidden error response
func ForbiddenResponse(c *gin.Context) {
	ErrorResponse(c, http.StatusForbidden, "forbidden")
}

// InternalErrorResponse sends an internal server error response
func InternalErrorResponse(c *gin.Context) {
	ErrorResponse(c, http.StatusInternalServerError, "internal server error")
}
