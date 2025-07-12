package audiohandler

import (
	"fmt"
	"log"
	"net/http"
	"snout/audio"
	"snout/handlers"
	"snout/models"
	"snout/plans"
	"snout/storage"
	"snout/supabase"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AudioHandler struct {
	*handlers.Handler
	AudioClient *audio.Client
}

func New(dbClient *supabase.Client, audioClient *audio.Client) *AudioHandler {
	return &AudioHandler{
		Handler:     handlers.New(dbClient),
		AudioClient: audioClient,
	}
}

// @Summary		Check audio service health
// @Description	Check if the audio service is live
// @Tags			audio
// @Accept			json
// @Produce		json
// @Success		200	{object}	models.AudioHealthResponse
// @Router			/audio [get]
func (h *AudioHandler) CheckHealth(c *gin.Context) {
	c.JSON(http.StatusOK, models.AudioHealthResponse{
		Status: "live",
	})
}

// @Summary		Get audiobook
// @Description	Get audiobook for a news_id
// @Tags			audio
// @Accept			json
// @Produce		json
// @Param			news_id		query		string	false	"News ID"
// @Param			story_id	query		string	false	"Story ID"
// @Param			type		query		string	true	"story"
// @Param			page		query		string	true	"1"
// @Success		200			{object}	models.AudiobookResponse
// @Failure		404			{object}	models.ErrorResponse
// @Router			/audio/audiobook [get]
func (h *AudioHandler) GetAudiobook(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	pageStr := c.Query("page")
	contentType := c.Query("type")
	newsIDStr := c.Query("news_id")
	storyIDStr := c.Query("story_id")
	if newsIDStr == "" && storyIDStr == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "Must specify a story_id or a news_id",
		})
		return
	}

	idStr := newsIDStr
	if contentType == "story" {
		idStr = storyIDStr
	}
	_, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "Given id must be a valid integer",
		})
		return
	}
	audiobookInfo, err := h.DBClient.GetAudiobook(contentType, idStr)
	if err != nil {
		log.Printf("Error getting audiobook: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Error getting audiobook",
		})
		return
	}

	pageInt, err := strconv.Atoi(pageStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: fmt.Sprint("Given page must be a valid integer", contentType),
		})
		return
	}

	if audiobookInfo.Tier == "" {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error: fmt.Sprintf("No audiobook available for this %s_id", contentType),
		})
		return
	}

	if pageInt >= audiobookInfo.Pages || pageInt < 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "Incorrect page index",
		})
		return
	}

	if audiobookInfo.Tier == "BASIC" {
		if !h.CheckUsageLimit(c, userID, plans.BASIC_AUDIOBOOKS_FEATURE) {
			return
		}
	} else if audiobookInfo.Tier == "PREMIUM" {
		if !h.CheckUsageLimit(c, userID, plans.PREMIUM_AUDIOBOOKS_FEATURE) {
			return
		}
	}

	keyContentType := "News"
	if contentType == "story" {
		keyContentType = "Story"
	}
	s3Key := storage.GetAudiobookKey(audiobookInfo.Language, audiobookInfo.CEFRLevel, audiobookInfo.Topic, audiobookInfo.Date.Format("2006-01-02"), pageInt, keyContentType)
	presignedURL, err := storage.GetPresignedURL(s3Key, 5) // 5 minute exp
	if err != nil {
		log.Printf("Error generating pre-signed URL: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Error accessing audiobook",
		})
		return
	}

	if audiobookInfo.Tier == "BASIC" {
		h.DBClient.InsertUsage(userID, plans.BASIC_AUDIOBOOKS_FEATURE, 1)
	} else if audiobookInfo.Tier == "PREMIUM" {
		h.DBClient.InsertUsage(userID, plans.PREMIUM_AUDIOBOOKS_FEATURE, 1)
	}

	c.JSON(http.StatusOK, models.AudiobookResponse{
		URL:       presignedURL,
		ExpiresIn: 300,
	})
}
