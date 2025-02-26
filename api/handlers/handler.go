package handlers

import (
	"fmt"
	"net/http"
	"story-api/supabase"
	"story-api/models"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	DBClient *supabase.Client
}

func New(dbClient *supabase.Client) *Handler {
	return &Handler{
		DBClient: dbClient,
	}
}

func (h *Handler) GetUserIDFromToken(c *gin.Context) string {
	value, exists := c.Get("sub")
	if !exists {
		return ""
	}
	if userID, ok := value.(string); ok {
		return userID
	}
	return ""
}

// checkIsRequiredRole -> true if is the correct role
// only X can access
func (h *Handler) CheckIsCorrectRole(c *gin.Context, userID string, role string) bool {
	isRole, err := h.DBClient.CheckAccountType(userID, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check account type"})
		return false
	}
	if !isRole {
		c.JSON(http.StatusForbidden, models.ErrorResponse{Error: fmt.Sprintf("Only %ss can access this endpoint.", role)})
		return false
	}
	return true
}

// checkNotForbiddenRole -> true if NOT the forbidden role 
// everyone but X can access
func (h *Handler) CheckNotForbiddenRole(c *gin.Context, userID string, role string) bool {
	isRole, err := h.DBClient.CheckAccountType(userID, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check account type"})
		return false
	}
	if isRole {
		c.JSON(http.StatusForbidden, models.ErrorResponse{Error: fmt.Sprintf("%ss cannot access this endpoint.", role)})
		return false
	}
	return true
}