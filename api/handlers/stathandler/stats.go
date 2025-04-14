// handlers/statshandler/stats.go
package statshandler

import (
	"net/http"

	"story-api/supabase"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	db *supabase.Client
}

func New(db *supabase.Client) *Handler {
	return &Handler{db: db}
}

// GetUserStats godoc
// @Summary Get user's study statistics
// @Description Retrieves study statistics for all user's decks
// @Tags stats
// @Accept json
// @Produce json
// @Success 200 {array} supabase.StudyStats
// @Failure 500 {object} gin.H
// @Router /stats [get]
func (h *Handler) GetUserStats(c *gin.Context) {
	userID := c.GetString("sub")

	stats, err := h.db.GetUserStudyStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch study statistics"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// RecordStudySession godoc
// @Summary Record study session results
// @Description Records the results of a study session for a deck
// @Tags stats
// @Accept json
// @Produce json
// @Param session body supabase.StudySession true "Study Session Info"
// @Success 200 {object} gin.H
// @Failure 400 {object} gin.H
// @Failure 404 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /stats/record [post]
func (h *Handler) RecordStudySession(c *gin.Context) {
	userID := c.GetString("sub")

	var session supabase.StudySession
	if err := c.ShouldBindJSON(&session); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Verify deck exists and user has access
	_, err := h.db.GetDeck(session.DeckID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Deck not found"})
		return
	}

	// Set user ID
	session.UserID = userID

	if err := h.db.RecordStudySession(session); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record study session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Study session recorded successfully"})
}
