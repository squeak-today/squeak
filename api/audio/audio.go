package audio

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type Client struct {
	apiKey string
}

type TranslateResponse struct {
	Data struct {
		Translations []struct {
			TranslatedText string `json:"translatedText"`
		} `json:"translations"`
	} `json:"data"`
}

type TTSRequest struct {
	Input struct {
		Text string `json:"text"`
	} `json:"input"`
	Voice struct {
		LanguageCode string `json:"languageCode"`
		Name         string `json:"name"`
	} `json:"voice"`
	AudioConfig struct {
		AudioEncoding string `json:"audioEncoding"`
	} `json:"audioConfig"`
}

type TTSResponse struct {
	AudioContent string `json:"audioContent"`
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey: apiKey,
	}
}

func (c *Client) Translate(sentence, source, target string) (string, error) {
	query := []string{sentence}
	translatePayload := map[string]interface{}{
		"q":      query,
		"source": source,
		"target": target,
		"format": "text",
	}

	jsonData, err := json.Marshal(translatePayload)
	if err != nil {
		return "", fmt.Errorf("translate payload marshalling failed: %v", err)
	}

	req, err := http.NewRequest("POST",
		"https://translation.googleapis.com/language/translate/v2?key="+c.apiKey,
		bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("request to GCP failed: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %v", err)
	}

	var result TranslateResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("failed to unmarshal response: %v", err)
	}

	if len(result.Data.Translations) == 0 {
		return "", fmt.Errorf("no translations returned")
	}

	return result.Data.Translations[0].TranslatedText, nil
}

func (c *Client) TextToSpeech(text, languageCode, voiceName string) (string, error) {
	ttsPayload := TTSRequest{
		Input: struct {
			Text string `json:"text"`
		}{
			Text: text,
		},
		Voice: struct {
			LanguageCode string `json:"languageCode"`
			Name         string `json:"name"`
		}{
			LanguageCode: languageCode,
			Name:         voiceName,
		},
		AudioConfig: struct {
			AudioEncoding string `json:"audioEncoding"`
		}{
			AudioEncoding: "MP3",
		},
	}

	jsonData, err := json.Marshal(ttsPayload)
	if err != nil {
		return "", fmt.Errorf("TTS payload marshalling failed: %v", err)
	}

	req, err := http.NewRequest("POST",
		"https://texttospeech.googleapis.com/v1/text:synthesize?key="+c.apiKey,
		bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("request to GCP failed: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("google API returned error: status=%d body=%s", resp.StatusCode, string(body))
	}

	var result TTSResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("failed to unmarshal response: %v, body: %s", err, string(body))
	}

	if result.AudioContent == "" {
		return "", fmt.Errorf("no audio content in response: %s", string(body))
	}

	return result.AudioContent, nil
}
