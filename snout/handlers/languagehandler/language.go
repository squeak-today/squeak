package languagehandler

import (
	"log"
	"net/http"
	"snout/audio"
	"snout/handlers"
	"snout/models"
	"snout/plans"
	"snout/supabase"
	"strings"

	"github.com/gin-gonic/gin"
)

type LanguageHandler struct {
	*handlers.Handler
	AudioClient *audio.Client
}

func New(dbClient *supabase.Client, audioClient *audio.Client) *LanguageHandler {
	return &LanguageHandler{
		Handler:     handlers.New(dbClient),
		AudioClient: audioClient,
	}
}

// @Summary		Translate text
// @Description	Translate text from source language to target language
// @Tags			language
// @Accept			json
// @Produce		json
// @Param			request	body		models.TranslateRequest	true	"Translation request"
// @Success		200		{object}	models.TranslateResponse
// @Failure		400		{object}	models.ErrorResponse
// @Router			/language/translate [post]
func (h *LanguageHandler) Translate(c *gin.Context) {
	var infoBody models.TranslateRequest
	if err := c.ShouldBindJSON(&infoBody); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	translatedText, detectedSourceLanguage, err := h.AudioClient.Translate(infoBody.Sentence, infoBody.Target)
	if err != nil {
		log.Printf("Translation failed: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Translation failed",
		})
		return
	}

	c.JSON(http.StatusOK, models.TranslateResponse{
		Sentence: translatedText,
		DetectedSourceLanguage: detectedSourceLanguage,
	})
}

// @Summary		Text to speech
// @Description	Convert text to speech audio
// @Tags			language
// @Accept			json
// @Produce		json
// @Param			request	body		models.TextToSpeechRequest	true	"Text to speech request"
// @Success		200		{object}	models.TextToSpeechResponse
// @Failure		400		{object}	models.ErrorResponse
// @Failure		500		{object}	models.ErrorResponse
// @Router			/language/tts [post]
func (h *LanguageHandler) TextToSpeech(c *gin.Context) {
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

// @Summary		Speech to text
// @Description	Convert speech audio to text
// @Tags			language
// @Accept			json
// @Produce		json
// @Param			request	body		models.SpeechToTextRequest	true	"Speech to text request"
// @Success		200		{object}	models.SpeechToTextResponse
// @Failure		400		{object}	models.ErrorResponse
// @Router			/language/stt [post]
func (h *LanguageHandler) SpeechToText(c *gin.Context) {
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
