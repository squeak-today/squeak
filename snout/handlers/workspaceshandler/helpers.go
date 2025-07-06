package workspaceshandler

import (
	"net/http"

	models "snout/models"
	"snout/supabase/workspaces"
	"github.com/gin-gonic/gin"
)

func (h *WorkspacesHandler) CheckWorkspaceUserOwnership(c *gin.Context, userId string, workspaceId string) bool {
	exists, err := workspaces.CheckWorkspaceUserOwnership(h.DBClient, userId, workspaceId)
	if err != nil {
		return false
	}
	if !exists {
		c.JSON(http.StatusForbidden, models.ErrorResponse{Error: "User does not have access to this workspace"})
		return false
	}
	return true
}