package audiohandler

import (
	"log"
	"strings"
	"net/http"
	"story-api/audio"
	"story-api/handlers"
	"story-api/models"
	"story-api/supabase"

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
	var infoBody models.TextToSpeechRequest
	if err := c.ShouldBindJSON(&infoBody); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	audioContent, err := h.AudioClient.TextToSpeech(infoBody.Text, infoBody.LanguageCode, infoBody.VoiceName)
	if err != nil {
		log.Printf("Text-to-speech failed: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Text-to-speech failed",
		})
		return
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
	var infoBody models.SpeechToTextRequest
	if err := c.ShouldBindJSON(&infoBody); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body"})
		return
	}

	transcript, err := h.AudioClient.SpeechToText(infoBody.AudioContent, infoBody.LanguageCode)
	if err != nil {
		if strings.Contains(err.Error(), "NO TRANSCRIPT") {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{
				Error: "Speech-to-text failed",
				Code: "NO_TRANSCRIPT",
			})
			return
		}
		log.Printf("Speech-to-text failed: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error: "Speech-to-text failed",
		})
		return
	}

	c.JSON(http.StatusOK, models.SpeechToTextResponse{
		Transcript: transcript,
	})
}
