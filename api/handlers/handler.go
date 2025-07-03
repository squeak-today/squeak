package handlers

import (
	"fmt"
	"net/http"
	"squeak-api/models"
	"squeak-api/plans"
	"squeak-api/supabase"

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

func (h *Handler) CheckUserPlan(c *gin.Context, userID string) (string, error) {
	plan := "FREE"
	plan, _, _, _, _, err := h.DBClient.GetBillingAccount(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get billing account"})
		return "", err
	}
	return plan, nil
}

func (h *Handler) CheckUsageLimit(c *gin.Context, userID string, featureID string) bool {
	plan, err := h.CheckUserPlan(c, userID) // updates c.JSON if error
	if err != nil {
		return false
	}
	if plan == "FREE" { // we increment usage for their free plan
		usage, err := h.DBClient.GetUsage(userID, featureID, plan)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get usage"})
			return false
		}

		limit := plans.FEATURE_ACCESS_LIMITS_BY_PLAN[featureID].Plan[plan]
		if limit == -1 {
			return true
		} else if limit == 0 {
			c.JSON(http.StatusForbidden, models.ErrorResponse{
				Error: fmt.Sprintf("Usage restricted on %s", featureID),
				Code:  models.USAGE_RESTRICTED,
			})
			return false
		}
		if usage >= limit {
			c.JSON(http.StatusForbidden, models.ErrorResponse{
				Error: fmt.Sprintf("Usage limit reached on %s", featureID),
				Code:  models.USAGE_LIMIT_REACHED,
			})
			return false
		}
	}
	return true
}
