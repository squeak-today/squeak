package elevenlabs

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

const (
	ELEVENLABS_FRENCH_VOICE_ID  string = "Ndm6bI6wo3Ycnlx1PPZS" // Luca
	ELEVENLABS_SPANISH_VOICE_ID string = "rEVYTKPqwSMhytFPayIb" // Sandra
)

type AlignmentData struct {
	Characters                 []string  `json:"characters"`
	CharacterStartTimesSeconds []float64 `json:"character_start_times_seconds"`
	CharacterEndTimesSeconds   []float64 `json:"character_end_times_seconds"`
}

type ElevenLabsResponse struct {
	AudioBase64         string        `json:"audio_base64"`
	Alignment           AlignmentData `json:"alignment"`
	NormalizedAlignment AlignmentData `json:"normalized_alignment"`
}

func ElevenLabsTTSWithTiming(text string, voiceId string, apiKey string) (*ElevenLabsResponse, error) {
	payload := map[string]any{
		"text":     text,
		"model_id": "eleven_flash_v2_5",
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("ElevenLabs payload marshalling failed: %v", err)
	}

	url := fmt.Sprintf("https://api.elevenlabs.io/v1/text-to-speech/%s/with-timestamps", voiceId)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create ElevenLabs request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("xi-api-key", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request to ElevenLabs failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("ElevenLabs API returned non-OK status: %d - %s", resp.StatusCode, string(body))
	}

	var result ElevenLabsResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode ElevenLabs response: %v", err)
	}

	return &result, nil
}
