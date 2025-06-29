package audiohandler

import (
	"log"
	"net/http"
	"story-api/audio"
	"story-api/handlers"
	"story-api/models"
	"story-api/plans"
	"story-api/storage"
	"story-api/supabase"
	"strconv"
	"strings"
	"fmt"

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

//	@Summary		Check audio service health
//	@Description	Check if the audio service is live
//	@Tags			audio
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	models.AudioHealthResponse
//	@Router			/audio [get]
func (h *AudioHandler) CheckHealth(c *gin.Context) {
	c.JSON(http.StatusOK, models.AudioHealthResponse{
		Status: "live",
	})
}

//	@Summary		Translate text
//	@Description	Translate text from source language to target language
//	@Tags			audio
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.TranslateRequest	true	"Translation request"
//	@Success		200		{object}	models.TranslateResponse
//	@Failure		400		{object}	models.ErrorResponse
//	@Router			/audio/translate [post]
func (h *AudioHandler) Translate(c *gin.Context) {
	var infoBody models.TranslateRequest
	if err := c.ShouldBindJSON(&infoBody); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	translatedText, err := h.AudioClient.Translate(infoBody.Sentence, infoBody.Source, infoBody.Target)
	if err != nil {
		log.Printf("Translation failed: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Translation failed",
		})
		return
	}

	c.JSON(http.StatusOK, models.TranslateResponse{
		Sentence: translatedText,
	})
}

//	@Summary		Text to speech
//	@Description	Convert text to speech audio
//	@Tags			audio
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.TextToSpeechRequest	true	"Text to speech request"
//	@Success		200		{object}	models.TextToSpeechResponse
//	@Failure		400		{object}	models.ErrorResponse
//	@Failure		500		{object}	models.ErrorResponse
//	@Router			/audio/tts [post]
func (h *AudioHandler) TextToSpeech(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	var infoBody models.TextToSpeechRequest
	if err := c.ShouldBindJSON(&infoBody); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	if infoBody.Natural {
		if !h.CheckUsageLimit(c, userID, plans.NATURAL_TTS_FEATURE) {
			return
		}
	}

	audioContent, err := h.AudioClient.TextToSpeech(infoBody.Text, infoBody.LanguageCode, infoBody.VoiceName, infoBody.Natural)
	if err != nil {
		log.Printf("Text-to-speech failed: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Text-to-speech failed",
		})
		return
	}

	if infoBody.Natural {
		h.DBClient.InsertUsage(userID, plans.NATURAL_TTS_FEATURE, 1)
	}
	c.JSON(http.StatusOK, models.TextToSpeechResponse{
		AudioContent: audioContent,
	})
}

//	@Summary		Speech to text
//	@Description	Convert speech audio to text
//	@Tags			audio
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.SpeechToTextRequest	true	"Speech to text request"
//	@Success		200		{object}	models.SpeechToTextResponse
//	@Failure		400		{object}	models.ErrorResponse
//	@Router			/audio/stt [post]
func (h *AudioHandler) SpeechToText(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	var infoBody models.SpeechToTextRequest
	if err := c.ShouldBindJSON(&infoBody); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	if infoBody.Premium {
		if !h.CheckUsageLimit(c, userID, plans.PREMIUM_STT_FEATURE) {
			return
		}
	}

	transcript, err := h.AudioClient.SpeechToText(infoBody.AudioContent, infoBody.LanguageCode, infoBody.Premium)
	if err != nil {
		if strings.Contains(err.Error(), "NO TRANSCRIPT") {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{
				Error: "Speech-to-text failed",
				Code:  "NO_TRANSCRIPT",
			})
			return
		}
		log.Printf("Speech-to-text failed: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Speech-to-text failed",
		})
		return
	}

	if infoBody.Premium {
		h.DBClient.InsertUsage(userID, plans.PREMIUM_STT_FEATURE, 1)
	}

	c.JSON(http.StatusOK, models.SpeechToTextResponse{
		Transcript: transcript,
	})
}

//	@Summary		Get audiobook
//	@Description	Get audiobook for a news_id
//	@Tags			audio
//	@Accept			json
//	@Produce		json
//	@Param			news_id		query		string	false	"News ID"
//	@Param			story_id	query		string	false	"Story ID"
//	@Param			type		query		string	true	"story"
//	@Param			page		query		string	true	"1"
//	@Success		200			{object}	models.AudiobookResponse
//	@Failure		404			{object}	models.ErrorResponse
//	@Router			/audio/audiobook [get]
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
	
	_, classroomID, err := h.DBClient.CheckStudentStatus(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check student status"})
		return
	}
	if classroomID != "" {
		accepted, err := h.DBClient.CheckAcceptedContent(classroomID, "News", newsIDStr)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to check accepted content"})
			return
		}
		if !accepted {
			c.JSON(http.StatusForbidden, models.ErrorResponse{Error: "Content not accepted in classroom"})
			return
		}
	}
	idStr := newsIDStr
	if contentType == "story" { idStr = storyIDStr }
	_, err = strconv.Atoi(idStr)
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
	if contentType == "story" { keyContentType = "Story" }
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
