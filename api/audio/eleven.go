package audio

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
)

const (
	ELEVENLABS_FRENCH_VOICE_ID  string = "Ndm6bI6wo3Ycnlx1PPZS" // Luca
	ELEVENLABS_SPANISH_VOICE_ID string = "rEVYTKPqwSMhytFPayIb" // Sandra
)

func ElevenLabsTextToSpeech(text string, voiceId string, apiKey string) (string, error) {
	payload := map[string]any{
		"text":     text,
		"model_id": "eleven_flash_v2_5",
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("ElevenLabs payload marshalling failed: %v", err)
	}

	url := fmt.Sprintf("https://api.elevenlabs.io/v1/text-to-speech/%s?output_format=mp3_44100_128", voiceId)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create ElevenLabs request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("xi-api-key", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("request to ElevenLabs failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("ElevenLabs API returned error: status=%d body=%s", resp.StatusCode, string(body))
	}

	audioBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read ElevenLabs response body: %v", err)
	}

	base64Audio := base64.StdEncoding.EncodeToString(audioBytes)
	return base64Audio, nil
}

func ElevenLabsSpeechToText(audioBase64 string, apiKey string) (string, error) {
	audioData, err := base64.StdEncoding.DecodeString(audioBase64)
	if err != nil {
		return "", fmt.Errorf("failed to decode base64 audio: %v", err)
	}

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	err = writer.WriteField("model_id", "scribe_v1")
	if err != nil {
		return "", fmt.Errorf("failed to write model_id field: %v", err)
	}

	part, err := writer.CreateFormFile("file", "audio.webm")
	if err != nil {
		return "", fmt.Errorf("failed to create form file: %v", err)
	}

	_, err = part.Write(audioData)
	if err != nil {
		return "", fmt.Errorf("failed to write audio data: %v", err)
	}

	err = writer.Close()
	if err != nil {
		return "", fmt.Errorf("failed to close multipart writer: %v", err)
	}

	req, err := http.NewRequest("POST", "https://api.elevenlabs.io/v1/speech-to-text", body)
	if err != nil {
		return "", fmt.Errorf("failed to create ElevenLabs STT request: %v", err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("xi-api-key", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("request to ElevenLabs failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("ElevenLabs API returned error: status=%d body=%s", resp.StatusCode, string(bodyBytes))
	}

	var result struct {
		Text string `json:"text"`
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %v", err)
	}

	err = json.Unmarshal(bodyBytes, &result)
	if err != nil {
		return "", fmt.Errorf("failed to unmarshal response: %v, body: %s", err, string(bodyBytes))
	}

	if result.Text == "" {
		return "", fmt.Errorf("no transcript in response: %s", string(bodyBytes))
	}

	return result.Text, nil
}
