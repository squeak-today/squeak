package workspaceshandler


import (
	"net/http"

	models "snout/models"
	workspaces_models "snout/models/workspaces"
	workspaces "snout/supabase/workspaces"

	"github.com/gin-gonic/gin"
)


//	@Summary		Create database
//	@Description	Create database
//	@Tags			workspace
//	@Accept			json
//	@Produce		json
//	@Param			workspace_id	path		string	true	"Workspace ID"
//	@Success		200				{object}	workspaces_models.CreateDatabaseResponse
//	@Failure		400				{object}	models.ErrorResponse
//	@Failure		500				{object}	models.ErrorResponse
//	@Router			/workspaces/{workspace_id}/databases/create [post]
func (h *WorkspacesHandler) CreateDatabase(c *gin.Context) {
	userId := h.GetUserIDFromToken(c)
	workspaceId := c.Param("workspace_id")

	if !h.CheckWorkspaceUserOwnership(c, userId, workspaceId) {
		return
	}

	var request workspaces_models.CreateDatabaseRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	databaseId, err := workspaces.CreateDatabase(h.DBClient, request.Type, workspaceId, request.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create database"})
		return
	}

	c.JSON(http.StatusOK, workspaces_models.CreateDatabaseResponse{ID: databaseId})
}