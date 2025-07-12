package models

type TranslateRequest struct {
	Sentence string `json:"sentence" binding:"required" example:"Hello, how are you?"`
	Target   string `json:"target" binding:"required" example:"fr"`
}

type TranslateResponse struct {
	Sentence string `json:"sentence" required:"true" example:"Bonjour, comment allez-vous?"`
	DetectedSourceLanguage   string `json:"detected_source_language" required:"true" example:"fr"`
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