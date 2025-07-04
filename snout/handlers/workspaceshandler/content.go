package workspaceshandler

import (
	"log"
	"net/http"

	models "snout/models"
	workspaces_models "snout/models/workspaces"
	// workspaces "snout/supabase/workspaces"

	"github.com/gin-gonic/gin"
)

// @Summary		Create content
// @Description	Create content
// @Tags			workspace
// @Accept			json
// @Produce		json
// @Param			workspace_id	path		string									true	"Workspace ID"
// @Param			database_id		path		string									true	"Database ID"
// @Param			content			body		workspaces_models.CreateContentRequest	true
// @Success		200				{object}	workspaces_models.CreateContentResponse
// @Failure		400				{object}	models.ErrorResponse
// @Failure		404				{object}	models.ErrorResponse
// @Failure		500				{object}	models.ErrorResponse
// @Router			/workspaces/{workspace_id}/databases/{database_id}/content/create [post]
func (h *WorkspacesHandler) CreateContent(c *gin.Context) {
	userId := h.GetUserIDFromToken(c)
	workspaceId := c.Param("workspace_id")
	databaseId := c.Param("database_id")

	var req workspaces_models.CreateContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}
	log.Println(userId, workspaceId, databaseId)
	log.Println(req)

	h.Producer.Send(req)

	c.JSON(http.StatusOK, workspaces_models.CreateContentResponse{})
}
