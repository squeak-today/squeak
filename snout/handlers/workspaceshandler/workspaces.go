package workspaceshandler

import (
	"net/http"

	"snout/handlers"
	models "snout/models"
	workspaces_models "snout/models/workspaces"
	"snout/producer"
	"snout/supabase"
	workspaces "snout/supabase/workspaces"

	"github.com/gin-gonic/gin"
)

type WorkspacesHandler struct {
	*handlers.Handler
	Producer *producer.Producer
}

func New(dbClient *supabase.Client, producer *producer.Producer) *WorkspacesHandler {
	return &WorkspacesHandler{
		Handler:  handlers.New(dbClient),
		Producer: producer,
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
