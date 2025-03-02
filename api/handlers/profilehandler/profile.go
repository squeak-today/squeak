package profilehandler

import (
	"database/sql"
	"log"
	"net/http"
	"story-api/handlers"
	"story-api/models"
	"story-api/supabase"
	"strings"

	"github.com/gin-gonic/gin"
)

type ProfileHandler struct {
	*handlers.Handler
}

func New(dbClient *supabase.Client) *ProfileHandler {
	return &ProfileHandler{
		Handler: handlers.New(dbClient),
	}
}

//	@Summary		Get user profile
//	@Description	Get the user's profile information
//	@Tags			profile
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	models.GetProfileResponse
//	@Failure		404	{object}	models.ErrorResponse
//	@Router			/profile [get]
func (h *ProfileHandler) GetProfile(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)

	profile, err := h.DBClient.GetProfile(userID)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, models.ErrorResponse{
				Error: "Failed to retrieve profile",
				Code:  "PROFILE_NOT_FOUND",
			})
			return
		}
		log.Printf("Failed to retrieve profile: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve profile"})
		return
	}

	response := models.GetProfileResponse{
		Username:           profile.Username,
		LearningLanguage:   profile.LearningLanguage,
		SkillLevel:         profile.SkillLevel,
		InterestedTopics:   profile.InterestedTopics,
		DailyQuestionsGoal: profile.DailyQuestionsGoal,
	}

	c.JSON(http.StatusOK, response)
}

//	@Summary		Upsert user profile
//	@Description	Create or update the user's profile
//	@Tags			profile
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.UpsertProfileRequest	true	"Profile information"
//	@Success		200		{object}	models.UpsertProfileResponse
//	@Failure		400		{object}	models.ErrorResponse
//	@Failure		409		{object}	models.ErrorResponse
//	@Router			/profile/upsert [post]
func (h *ProfileHandler) UpsertProfile(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)

	var profile models.UpsertProfileRequest
	if err := c.ShouldBindJSON(&profile); err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	if profile.Username == "" || profile.LearningLanguage == "" || profile.SkillLevel == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Username, learning language, and skill level are required"})
		return
	}

	supabaseProfile := &supabase.Profile{
		Username:         profile.Username,
		LearningLanguage: profile.LearningLanguage,
		SkillLevel:       profile.SkillLevel,
		InterestedTopics: profile.InterestedTopics,
		DailyQuestionsGoal: profile.DailyQuestionsGoal,
	}

	id, err := h.DBClient.UpsertProfile(userID, supabaseProfile)
	if err != nil {
		log.Println(err)
		if strings.Contains(err.Error(), "unique constraint") {
			c.JSON(http.StatusConflict, models.ErrorResponse{Error: "Username already taken"})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to save profile"})
		return
	}

	c.JSON(http.StatusOK, models.UpsertProfileResponse{
		Message: "Profile updated successfully",
		ID:      id,
	})
}
