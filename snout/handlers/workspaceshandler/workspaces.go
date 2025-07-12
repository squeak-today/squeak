package workspaceshandler

import (
	"net/http"

	"snout/handlers"
	models "snout/models"
	workspaces_models "snout/models/workspaces"
	"snout/producer"
	"snout/storage"
	"snout/supabase"
	workspaces "snout/supabase/workspaces"

	"github.com/gin-gonic/gin"
)

type WorkspacesHandler struct {
	*handlers.Handler
	Producer *producer.Producer
	S3Client *storage.S3Client
}

func New(dbClient *supabase.Client, producer *producer.Producer, s3Client *storage.S3Client) *WorkspacesHandler {
	return &WorkspacesHandler{
		Handler:  handlers.New(dbClient),
		Producer: producer,
		S3Client: s3Client,
	}
}

// @Summary		Get workspaces
// @Description	Get workspaces
// @Tags			workspace
// @Accept			json
// @Produce		json
// @Success		200	{object}	workspaces_models.GetWorkspacesResponse
// @Failure		400	{object}	models.ErrorResponse
// @Failure		404	{object}	models.ErrorResponse
// @Failure		500	{object}	models.ErrorResponse
// @Router			/workspaces [get]
func (h *WorkspacesHandler) GetWorkspaces(c *gin.Context) {
	userId := h.GetUserIDFromToken(c)

	workspaces, err := workspaces.GetWorkspaces(h.DBClient, userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get workspaces"})
		return
	}

	c.JSON(http.StatusOK, workspaces_models.GetWorkspacesResponse{Workspaces: workspaces})
}

// @Summary		Create workspace
// @Description	Create workspace
// @Tags			workspace
// @Accept			json
// @Produce		json
// @Param			body	body		workspaces_models.CreateWorkspaceRequest	true	"Body"
// @Success		200		{object}	workspaces_models.CreateWorkspaceResponse
// @Failure		400		{object}	models.ErrorResponse
// @Failure		500		{object}	models.ErrorResponse
// @Router			/workspaces/create [post]
func (h *WorkspacesHandler) CreateWorkspace(c *gin.Context) {
	userId := h.GetUserIDFromToken(c)
	var request workspaces_models.CreateWorkspaceRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	workspaceId, err := workspaces.CreateWorkspace(h.DBClient, userId, request.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create workspace"})
		return
	}

	c.JSON(http.StatusOK, workspaces_models.CreateWorkspaceResponse{ID: workspaceId})
}

// @Summary		Get workspaces
// @Description	Get workspaces
// @Tags			workspace
// @Accept			json
// @Produce		json
// @Success		200	{object}	workspaces_models.WorkspacesSummary
// @Failure		400	{object}	models.ErrorResponse
// @Failure		404	{object}	models.ErrorResponse
// @Failure		500	{object}	models.ErrorResponse
// @Router			/workspaces/summary [get]
func (h *WorkspacesHandler) GetWorkspacesSummary(c *gin.Context) {
	userId := h.GetUserIDFromToken(c)

	summary, err := workspaces.GetWorkspacesSummary(h.DBClient, userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get workspaces summary"})
		return
	}

	c.JSON(http.StatusOK, summary)
}
