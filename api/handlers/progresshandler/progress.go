package progresshandler

import (
	"log"
	"net/http"
	"story-api/handlers"
	"story-api/models"
	"story-api/supabase"

	"strconv"

	"github.com/gin-gonic/gin"
)

type ProgressHandler struct {
	*handlers.Handler
}

func New(dbClient *supabase.Client) *ProgressHandler {
	return &ProgressHandler{
		Handler: handlers.New(dbClient),
	}
}

// @Summary		Get today's progress
// @Description	Get the user's progress for today
// @Tags			progress
// @Accept			json
// @Produce		json
// @Success		200	{object}	models.TodayProgressResponse
// @Router			/progress [get]
func (h *ProgressHandler) GetTodayProgress(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)

	progress, err := h.DBClient.GetTodayProgress(userID)
	if err != nil {
		log.Printf("Failed to get progress: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get progress"})
		return
	}

	response := models.TodayProgressResponse{
		UserID:             progress.UserID,
		Date:               progress.Date,
		QuestionsCompleted: progress.QuestionsCompleted,
		GoalMet:            progress.GoalMet,
	}

	c.JSON(http.StatusOK, response)
}

// @Summary		Get streak information
// @Description	Get the user's current streak and completion status
// @Tags			progress
// @Accept			json
// @Produce		json
// @Success		200	{object}	models.StreakResponse
// @Router			/progress/streak [get]
func (h *ProgressHandler) GetStreak(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)

	streak, completedToday, err := h.DBClient.GetProgressStreak(userID)
	if err != nil {
		log.Printf("Failed to get streak: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get streak"})
		return
	}

	c.JSON(http.StatusOK, models.StreakResponse{
		Streak:         streak,
		CompletedToday: completedToday,
	})
}

// @Summary		Increment questions completed
// @Description	Increment the number of questions completed for today
// @Tags			progress
// @Accept			json
// @Produce		json
// @Param			amount	query		int	true	"Amount to increment by"
// @Success		200		{object}	models.IncrementProgressResponse
// @Failure		400		{object}	models.ErrorResponse
// @Router			/progress/increment [get]
func (h *ProgressHandler) IncrementProgress(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	amount := c.Query("amount")

	if amount == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Amount parameter is required"})
		return
	}

	amountInt, err := strconv.Atoi(amount)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid amount parameter"})
		return
	}
	if amountInt < 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Amount parameter must be non-negative"})
		return
	}

	err = h.DBClient.IncrementQuestionsCompleted(userID, amountInt)
	if err != nil {
		log.Printf("Failed to increment progress: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to increment progress"})
		return
	}

	progress, err := h.DBClient.GetTodayProgress(userID)
	if err != nil {
		log.Printf("Failed to get updated progress: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get updated progress"})
		return
	}

	response := models.IncrementProgressResponse{
		UserID:             progress.UserID,
		Date:               progress.Date,
		QuestionsCompleted: progress.QuestionsCompleted,
		GoalMet:            progress.GoalMet,
	}

	c.JSON(http.StatusOK, response)
}
