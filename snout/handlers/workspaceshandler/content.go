package workspaceshandler

import (
	"context"
	"net/http"
	"time"

	models "snout/models"
	workspaces_models "snout/models/workspaces"
	workspaces "snout/supabase/workspaces"

	whisker "snout/whisker_types"

	"github.com/gin-gonic/gin"
)

// @Summary		Get incomplete jobs
// @Description	Get incomplete jobs
// @Tags			workspace
// @Accept			json
// @Produce		json
// @Param			workspace_id	path		string	true	"Workspace ID"
// @Param			database_id		path		string	true	"Database ID"
// @Success		200				{object}	workspaces_models.GetIncompleteJobsResponse
// @Failure		400				{object}	models.ErrorResponse
// @Failure		404				{object}	models.ErrorResponse
// @Failure		500				{object}	models.ErrorResponse
// @Router			/workspaces/{workspace_id}/databases/{database_id}/content/jobs [get]
func (h *WorkspacesHandler) GetIncompleteJobs(c *gin.Context) {
	userId := h.GetUserIDFromToken(c)
	workspaceId := c.Param("workspace_id")
	databaseId := c.Param("database_id")

	if !h.CheckWorkspaceUserOwnership(c, userId, workspaceId) {
		return
	}

	jobs, err := workspaces.GetIncompleteJobs(h.DBClient, userId, databaseId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, workspaces_models.GetIncompleteJobsResponse{Jobs: jobs})
}

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

	// TODO: send req.Link to the worker (requires whisker update too)
	h.Producer.Send(whisker.ContentJobRequest{
		ID: id,
		Job: whisker.ContentJob{
			ID:         id,
			Name:       req.Name,
			UserID:     userId,
			DatabaseID: databaseId,
			Status:     whisker.ContentJobStatusCreation,
			CreatedAt:  time.Now(),
		},
	})

	c.JSON(http.StatusOK, workspaces_models.CreateContentResponse{})
}
