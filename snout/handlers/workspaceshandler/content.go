package workspaceshandler

import (
	"context"
	"net/http"

	models "snout/models"
	workspaces_models "snout/models/workspaces"
	workspaces "snout/supabase/workspaces"

	whisker "whisker/types"

	"github.com/gin-gonic/gin"
)

// @Summary		Create content
// @Description	Create content
// @Tags			workspace
// @Accept			json
// @Produce		json
// @Param			workspace_id	path		string									true	"Workspace ID"
// @Param			database_id		path		string									true	"Database ID"
// @Param			content			body		workspaces_models.CreateContentRequest	true	"Body"
// @Success		200				{object}	workspaces_models.CreateContentResponse
// @Failure		400				{object}	models.ErrorResponse
// @Failure		404				{object}	models.ErrorResponse
// @Failure		500				{object}	models.ErrorResponse
// @Router			/workspaces/{workspace_id}/databases/{database_id}/content/create [post]
func (h *WorkspacesHandler) CreateContent(c *gin.Context) {
	userId := h.GetUserIDFromToken(c)
	workspaceId := c.Param("workspace_id")
	databaseId := c.Param("database_id")

	if !h.CheckWorkspaceUserOwnership(c, userId, workspaceId) {
		return
	}

	var req workspaces_models.CreateContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	id, err := workspaces.CreateContentJob(context.Background(), h.DBClient, userId, databaseId, req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: err.Error()})
		return
	}

	h.Producer.Send(whisker.ContentJobRequest{
		ID: id,
		Job: whisker.ContentJob{
			Name:       req.Name,
			UserID:     userId,
			DatabaseID: databaseId,
		},
	})

	c.JSON(http.StatusOK, workspaces_models.CreateContentResponse{})
}
