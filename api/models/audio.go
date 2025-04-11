package models

type AudioHealthResponse struct {
	Status string `json:"status" binding:"required" example:"live"`
}

type TranslateRequest struct {
	Sentence string `json:"sentence" binding:"required" example:"Hello, how are you?"`
	Source   string `json:"source" binding:"required" example:"en"`
	Target   string `json:"target" binding:"required" example:"fr"`
}

type TranslateResponse struct {
	Sentence string `json:"sentence" example:"Bonjour, comment allez-vous?"`
}

type TextToSpeechRequest struct {
	Text         string `json:"text" binding:"required" example:"Hello, how are you?"`
	LanguageCode string `json:"language_code" binding:"required" example:"en-US"`
	VoiceName    string `json:"voice_name" binding:"required" example:"en-US-Standard-A"`
	Natural      bool   `json:"natural" example:"false"`
}

type TextToSpeechResponse struct {
	AudioContent string `json:"audio_content" binding:"required" example:"base64-encoded-audio-content"`
}

type SpeechToTextRequest struct {
	AudioContent string `json:"audio_content" binding:"required" example:"base64-encoded-audio-content"`
	LanguageCode string `json:"language_code" binding:"required" example:"en-US"`
	Premium      bool   `json:"premium" example:"false"`
}

type SpeechToTextResponse struct {
	Transcript string `json:"transcript" binding:"required" example:"Hello, how are you?"`
}

type AudiobookResponse struct {
	URL       string `json:"url" binding:"required" example:"https://bucket.s3.amazonaws.com/path/to/file?signed-params"`
	ExpiresIn int    `json:"expires_in" binding:"required" example:"300"`
}
