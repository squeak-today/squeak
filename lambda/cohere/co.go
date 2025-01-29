package cohere

import (
	"os"
	"encoding/json"
	"net/http"
	"io"
	"errors"
	"bytes"
	"log"
	"story-gen-lambda/prompts"
)

type Citation struct {
	Start int `json:"start"`
	End int `json:"end"`
	Text string `json:"text"`
	DocumentIDs []string `json:"document_ids"`
}

type Document struct {
	ID string `json:"id"`
	Snippet string `json:"snippet"`
	Timestamp string `json:"timestamp"`
	Title string `json:"title"`
	URL string `json:"url"`
}

// https://docs.cohere.com/v1/reference/chat
type v1Response struct {
	Text string `json:"text"`

	// This only is needed if we modify for citations and tool input.
	Citations []Citation `json:"citations"`
	Documents []Document `json:"documents"`
	FinishReason string `json:"finish_reason"`
}

type v2Response struct {
	Message struct {
		Content []struct {
			Text string `json:"text"`
			Type string `json:"type"`
		} `json:"content"`
	} `json:"message"`
	FinishReason string `json:"finish_reason"`
}

func generateStory(language string, cefr string, topic string, max_retries int) (v2Response, error) {
	emptyResponse := v2Response{}
	if (max_retries == 0) {
		return emptyResponse, errors.New("MULTIPLE RUNAWAYS ON THIS STORY")
	}
	cohereAPIKey := os.Getenv("COHERE_API_KEY")
	if cohereAPIKey == "" { return emptyResponse, errors.New("ERR: COHERE_API_KEY environment variable not set") }

	startingMessage := prompts.CreateStoryPrompt(language, cefr, topic)
	coherePayload := map[string]interface{}{
        "model": "c4ai-aya-expanse-32b",
        "messages": []map[string]string{
            {
				"role": "system",
				"content": "You are Command R+, a large language model trained to have polite, helpful, inclusive conversations with people.",
		  	},
			{
				"role": "user",
				"content": startingMessage,
			},
        },
    }

	jsonData, err := json.Marshal(coherePayload)
    if err != nil { return emptyResponse, err }

	req, err := http.NewRequest("POST", "https://api.cohere.com/v2/chat", bytes.NewBuffer(jsonData))
    if err != nil { return emptyResponse, err }

	req.Header.Set("Accept", "application/json")
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer " + cohereAPIKey)

	client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil { return emptyResponse, err }
    defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
    if err != nil { return emptyResponse, err }

    // var result map[string]interface{}
    var result v2Response
	log.Println(string(body))
    if err := json.Unmarshal(body, &result); err != nil {
		log.Println(string(body)) // e.g improper model id (should add better reaction)
		return emptyResponse, err
	}

	if (result.FinishReason == "MAX_TOKENS") {
		return generateStory(language, cefr, topic, max_retries - 1)
	}

	return result, nil
}

// still needs testing, but has reliable output with Latin-based languages (and usually with all supported, but still should be tested.)
// EXAMPLE USAGE: generateNewsArticle("French", "B1", "today politics news", "SOURCE 0...")
func generateNewsArticle(language string, cefr string, query string, web_results string, max_retries int) (v1Response, error) {
	cohereAPIKey := os.Getenv("COHERE_API_KEY")
	emptyResponse := v1Response{}
	if (max_retries == 0) {
		return emptyResponse, errors.New("MULTIPLE RUNAWAYS ON THIS ARTICLE")
	}
	if cohereAPIKey == "" { return emptyResponse, errors.New("ERR: COHERE_API_KEY environment variable not set") }

	startingMessage := prompts.CreateNewsArticlePrompt(language, cefr, query, web_results)

	coherePayload := map[string]interface{}{
		"chat_history": []map[string]string{
			{
				"role": "system",
				"message": "You are Command R+, a large language model trained to have polite, helpful, inclusive conversations with people.",
		  	},
		},
		"message": startingMessage,
		"model": "command-r-plus-08-2024",
	}

	log.Println("Marshalling Cohere Payload")
	jsonData, err := json.Marshal(coherePayload)
    if err != nil { return emptyResponse, err }

	req, err := http.NewRequest("POST", "https://api.cohere.com/v1/chat", bytes.NewBuffer(jsonData))
    if err != nil { return emptyResponse, err }

	req.Header.Set("Accept", "application/json")
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer " + cohereAPIKey)

	log.Println("Comitting REQ")
	client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil { return emptyResponse, err }
    defer resp.Body.Close()
	log.Println("RECEIVE RESPONSE")

	body, err := io.ReadAll(resp.Body)
    if err != nil { return emptyResponse, err }

	var result v1Response
	if err := json.Unmarshal(body, &result); err != nil {
		log.Println(string(body)) // e.g improper model id (should add better reaction)
		return emptyResponse, err
	}

	if (result.FinishReason == "MAX_TOKENS") {
		return generateNewsArticle(language, cefr, query, web_results, max_retries - 1)
	}

	log.Println("Result")
	return result, nil
}