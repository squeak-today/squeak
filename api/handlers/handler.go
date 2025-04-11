package handlers

import (
	"fmt"
	"net/http"
	"story-api/models"
	"story-api/plans"
	"story-api/supabase"

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

func (h *Handler) CheckUserPlan(c *gin.Context, userID string) (string, error) {
	isStudent, err := h.DBClient.CheckAccountType(userID, "student")
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check account type"})
		return "", err
	}
	isTeacher, err := h.DBClient.CheckAccountType(userID, "teacher")
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check account type"})
		return "", err
	}

	plan := "FREE"
	// if student or teacher, check if they have classroom plan, thus not free
	// if normal user, check if they have premium access
	if isStudent || isTeacher {
		organizationID, err := h.DBClient.CheckOrganizationByUserID(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check organization"})
			return "", err
		}
		if organizationID != "" {
			plan, err = h.DBClient.GetOrganizationPlan(organizationID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get organization plan"})
				return "", err
			}
		}
	} else {
		plan, _, _, _, _, err = h.DBClient.GetBillingAccount(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get billing account"})
			return "", err
		}
	}
	return plan, nil
}

// returns false if the user has reached the usage limit
// true if we're good to continue
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
