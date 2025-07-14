package workspaceshandler

import (
	"log"
	"net/http"

	models "snout/models"
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

func (h *WorkspacesHandler) CheckWorkspaceNotDeleted(c *gin.Context, userId string, workspaceId string) bool {
	isValid, err := workspaces.CheckWorkspaceNotDeleted(h.DBClient, userId, workspaceId)
	if err != nil {
		log.Printf("Error checking workspace status: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check workspace status"})
		return false
	}
	if !isValid {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Cannot recover: parent workspace is deleted"})
		return false
	}
	return true
}

func (h *WorkspacesHandler) CheckDatabaseNotDeleted(c *gin.Context, userId string, databaseId string) bool {
	isValid, err := workspaces.CheckDatabaseNotDeleted(h.DBClient, userId, databaseId)
	if err != nil {
		log.Printf("Error checking database status: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check database status"})
		return false
	}
	if !isValid {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Cannot recover: parent database is deleted"})
		return false
	}
	return true
}
