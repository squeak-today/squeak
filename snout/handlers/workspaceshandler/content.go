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

// @Summary		Get content body
// @Description	Get content body
// @Tags			workspace
// @Accept			json
// @Produce		json
// @Param			workspace_id	path		string	true	"Workspace ID"
// @Param			database_id		path		string	true	"Database ID"
// @Param			content_id		path		string	true	"Content ID"
// @Success		200				{object}	workspaces_models.GetContentResponse
// @Failure		400				{object}	models.ErrorResponse
// @Failure		404				{object}	models.ErrorResponse
// @Failure		500				{object}	models.ErrorResponse
// @Router			/workspaces/{workspace_id}/databases/{database_id}/content/{content_id} [get]
func (h *WorkspacesHandler) GetContent(c *gin.Context) {
	userId := h.GetUserIDFromToken(c)
	workspaceId := c.Param("workspace_id")
	databaseId := c.Param("database_id")
	contentId := c.Param("content_id")

	if !h.CheckWorkspaceUserOwnership(c, userId, workspaceId) {
		return
	}

	if !h.CheckDatabaseUserOwnership(c, userId, workspaceId, databaseId) {
		return
	}

	content, err := workspaces.GetContent(context.Background(), h.DBClient, contentId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get content"})
		return
	}

	key := h.S3Client.ContentKey(userId, contentId)
	presignedURL, err := h.S3Client.GetPresignedURL(h.S3Client.Bucket, key, 60)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get presigned URL, " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, workspaces_models.GetContentResponse{
		Content:      content,
		PresignedURL: presignedURL,
	})
}

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

	if !h.CheckDatabaseUserOwnership(c, userId, workspaceId, databaseId) {
		return
	}

	jobs, err := workspaces.GetIncompleteJobs(h.DBClient, userId, databaseId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get incomplete jobs"})
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

	if !h.CheckDatabaseUserOwnership(c, userId, workspaceId, databaseId) {
		return
	}

	var req workspaces_models.CreateContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	id, err := workspaces.CreateContentJob(context.Background(), h.DBClient, userId, databaseId, req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create content job"})
		return
	}

	// TODO: send req.Link to the worker (requires whisker update too)
	h.Producer.Send(whisker.ContentJobRequest{
		ID: id,
		Job: whisker.ContentJob{
			ID:           id,
			Name:         req.Name,
			UserID:       userId,
			DatabaseID:   databaseId,
			Status:       whisker.ContentJobStatusCreation,
			LanguageCode: req.LanguageCode,
			CEFRLevel:    req.CEFRLevel,
			CreatedAt:    time.Now(),
		},
	})

	c.JSON(http.StatusOK, workspaces_models.CreateContentResponse{})
}
