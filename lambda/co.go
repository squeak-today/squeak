package main

import (
	"os"
	"encoding/json"
	"net/http"
	"io"
	"errors"
	"bytes"
	"log"

	"strings"
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

var cefrPrompts = map[string]string{
	"A1": "must use extremely basic, everyday vocabulary and short sentences and must be 60-120 words.",
	"A2": "must use simple vocabulary and clear sentences with some basic connectors. You must aim for 120-160 words.",
	"B1": "must include semi-complex sentences, specific terms, and connectors. Target 200-300 words.",
	"B2": "must include clear sentences with somewhat advanced vocabulary and some complex ideas. Use a variety of connectors to link your points. Target 300-400 words.",
	"C1": "must employ complex vocabulary, some nuanced expressions, and detailed phrasing with 700-1000 words.",
	"C2": "must employ very complex vocabulary, nuanced expressions, detailed phrasing, and very complex ideas. Target 1400-1900 words.",
}

func generateStory(language string, cefr string, topic string, max_retries int) (v2Response, error) {
	emptyResponse := v2Response{}
	cohereAPIKey := os.Getenv("COHERE_API_KEY")
	if cohereAPIKey == "" { return emptyResponse, errors.New("ERR: COHERE_API_KEY environment variable not set") }

	
	var sb strings.Builder
	sb.WriteString("You are an LLM designed to write " + language + " fiction stories. ")
	sb.WriteString("Using the topic of " + topic + ", write a fictional story that matches the writing complexity of " + cefr + " on the CEFR scale.")
	sb.WriteString("Your story " + cefrPrompts[cefr] + " ")
	sb.WriteString("Provide the story without preamble or other comment.\n\n")

	startingMessage := sb.String()
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
	if cohereAPIKey == "" { return emptyResponse, errors.New("ERR: COHERE_API_KEY environment variable not set") }
	
	var sb strings.Builder
	sb.WriteString("You are an LLM designed to write " + language + " news articles. ")
	sb.WriteString("Below this, you are given the results of a search query for \"" + query + "\". ")
	sb.WriteString("Using this information, write a news article that matches the writing complexity of " + cefr + " on the CEFR scale. ")
	sb.WriteString("Your article " + cefrPrompts[cefr] + " ")
	sb.WriteString("Your article must include a title styled like a newspaper headline.\n")
	sb.WriteString("Provide the article without preamble or other comment.\n\n")
	sb.WriteString(web_results)

	startingMessage := sb.String()

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