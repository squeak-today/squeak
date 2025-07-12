package workspaceshandler

import (
	"log"
	"net/http"

	models "snout/models"
	workspaces_models "snout/models/workspaces"
	"snout/supabase/workspaces"

	"github.com/gin-gonic/gin"
)

func (h *WorkspacesHandler) CheckWorkspaceUserOwnership(c *gin.Context, userId string, workspaceId string) bool {
	exists, err := workspaces.CheckWorkspaceUserOwnership(h.DBClient, userId, workspaceId)
	if err != nil {
		log.Printf("Error checking workspace ownership: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check workspace ownership"})
		return false
	}
	if !exists {
		c.JSON(http.StatusForbidden, models.ErrorResponse{Error: "User does not have access to this workspace"})
		return false
	}
	return true
}

func (h *WorkspacesHandler) CheckDatabaseUserOwnership(c *gin.Context, userId string, workspaceId string, databaseId string) bool {
	exists, err := workspaces.CheckDatabaseUserOwnership(h.DBClient, userId, workspaceId, databaseId)
	if err != nil {
		log.Printf("Error checking database ownership: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check database ownership"})
		return false
	}
	if !exists {
		c.JSON(http.StatusForbidden, models.ErrorResponse{Error: "User does not have access to this database"})
		return false
	}
	return true
}

func (h *WorkspacesHandler) CheckContentInDatabase(c *gin.Context, databaseId string, contentId string) bool {
	exists, err := workspaces.CheckContentInDatabase(h.DBClient, databaseId, contentId)
	if err != nil {
		log.Printf("Error checking content database: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check content database"})
		return false
	}
	if !exists {
		c.JSON(http.StatusForbidden, models.ErrorResponse{Error: "Content not found in database"})
		return false
	}
	return true
}

func (h *WorkspacesHandler) CheckDatabaseType(c *gin.Context, dbType workspaces_models.DatabaseType, databaseId string) bool {
	var table string
	switch dbType {
	case workspaces_models.DatabaseTypeContent:
		table = "content_databases"
	default:
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Unsupported database type"})
		return false
	}

	exists, err := workspaces.CheckDatabaseType(h.DBClient, table, databaseId)
	if err != nil {
		log.Printf("Error checking database type: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check database type"})
		return false
	}
	if !exists {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Wrong database type"})
		return false
	}
	return true
}
