package workspaceshandler

import (
	"net/http"

	models "snout/models"
	workspaces_models "snout/models/workspaces"
	workspaces "snout/supabase/workspaces"

	"github.com/gin-gonic/gin"
)

// @Summary		Create database
// @Description	Create database
// @Tags			workspace
// @Accept			json
// @Produce		json
// @Param			workspace_id	path		string									true	"Workspace ID"
// @Param			body			body		workspaces_models.CreateDatabaseRequest	true	"Body"
// @Success		200				{object}	workspaces_models.CreateDatabaseResponse
// @Failure		400				{object}	models.ErrorResponse
// @Failure		500				{object}	models.ErrorResponse
// @Router			/workspaces/{workspace_id}/databases/create [post]
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

	databaseId, err := workspaces.CreateDatabase(h.DBClient, request.Type, userId, workspaceId, request.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create database"})
		return
	}

	c.JSON(http.StatusOK, workspaces_models.CreateDatabaseResponse{ID: databaseId})
}

// @Summary		Query database
// @Description	Query database
// @Tags			workspace
// @Accept			json
// @Produce		json
// @Param			workspace_id	path		string									true	"Workspace ID"
// @Param			database_id	path		string									true	"Database ID"
// @Param			body			body		workspaces_models.QueryDatabaseRequest	true	"Body"
// @Success		200				{object}	workspaces_models.QueryDatabaseResponse
// @Failure		400				{object}	models.ErrorResponse
// @Failure		500				{object}	models.ErrorResponse
// @Router			/workspaces/{workspace_id}/databases/{database_id}/query [post]
func (h *WorkspacesHandler) QueryDatabase(c *gin.Context) {
	userId := h.GetUserIDFromToken(c)
	workspaceId := c.Param("workspace_id")
	databaseId := c.Param("database_id")

	if !h.CheckWorkspaceUserOwnership(c, userId, workspaceId) {
		return
	}
	if !h.CheckDatabaseUserOwnership(c, userId, workspaceId, databaseId) {
		return
	}

	var request workspaces_models.QueryDatabaseRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	if !h.CheckDatabaseType(c, request.Type, databaseId) {
		return
	}

	switch request.Type {
	case workspaces_models.DatabaseTypeContent:
		database, contents, err := workspaces.QueryContentDatabase(h.DBClient, databaseId)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to query database"})
			return
		}
		c.JSON(http.StatusOK, workspaces_models.QueryDatabaseResponse{
			Database:    database,
			ContentRows: contents,
		})
	default:
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Unsupported database type"})
		return
	}
}
