package handlers

import (
	"fmt"
	"net/http"
	"story-api/models"
	"story-api/supabase"

	"github.com/gin-gonic/gin"
)

const (
	NATURAL_TTS_USAGE_LIMIT_FREE = 20
	PREMIUM_STT_USAGE_LIMIT_FREE = 20
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

// returns false if the user has reached the usage limit
// true if we're good to continue
func (h *Handler) CheckUsageLimit(c *gin.Context, userID string, featureID string, limit int) bool {
	plan, _, _, _, _, err := h.DBClient.GetBillingAccount(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get billing account"})
		return false
	}
	if plan == "FREE" {
		usage, err := h.DBClient.GetUsage(userID, featureID, plan)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get usage"})
			return false
		}
		if usage >= limit {
			c.JSON(http.StatusForbidden, models.ErrorResponse{
				Error: fmt.Sprintf("Usage limit reached on %s", featureID),
				Code:  models.USER_LIMIT_REACHED,
			})
			return false
		}
	}
	return true
}
