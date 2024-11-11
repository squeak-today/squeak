package main

import (
	"os"
	"fmt"
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
}

type v2Response struct {
	Message struct {
		Content []struct {
			Text string `json:"text"`
			Type string `json:"type"`
		} `json:"content"`
	} `json:"message"`
}

func generateStory(language string, cefr string, topic string) (v2Response, error) {
	emptyResponse := v2Response{}
	cohereAPIKey := os.Getenv("COHERE_API_KEY")
	if cohereAPIKey == "" { return emptyResponse, errors.New("ERR: COHERE_API_KEY environment variable not set") }

	startingMessage := fmt.Sprintf("LANGUAGE: %s\nCEFR: %s\nTOPIC: %s", language, cefr, topic)
	coherePayload := map[string]interface{}{
        "model": "c4ai-aya-expanse-32b",
        "messages": []map[string]string{
            {
                "role": "system",
                "content": // we don't use "USEFUL WORDS" so maybe remove for now?
					`You are Squeak, an LLM designed to write short stories or news stories. 
					The nature of the story is dependent on CEFR, LANGUAGE, TOPIC, and USEFUL WORDS.
					You must write your story in the LANGUAGE on TOPIC using at least one of the USEFUL WORDS translated without sacrificing story quality.
					The difficulty of the story MUST be understandable to the CEFR provided.
					You should provide the story without preamble or other comment.`,
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
    if err := json.Unmarshal(body, &result); err != nil {
		log.Println(string(body)) // e.g improper model id (should add better reaction)
		return emptyResponse, err
	}

	return result, nil
}

// still needs testing, but has reliable output with Latin-based languages (and usually with all supported, but still should be tested.)
// EXAMPLE USAGE: generateNewsArticle("French", "B1", "today politics news", "SOURCE 0...")
func generateNewsArticle(language string, cefr string, query string, web_results string) (v1Response, error) {
	cefrPrompts := map[string]string{
		"C2": "Your article must employ very complex vocabulary, nuanced expressions, and detailed phrasing with 1400-1900 words",
	}
	
	cohereAPIKey := os.Getenv("COHERE_API_KEY")
	emptyResponse := v1Response{}
	if cohereAPIKey == "" { return emptyResponse, errors.New("ERR: COHERE_API_KEY environment variable not set") }
	
	var sb strings.Builder
	sb.WriteString("You are an LLM designed to write " + language + " news articles. ")
	sb.WriteString("Below this, you are given the results of a search query for \"" + query + "\". ")
	sb.WriteString("Using this information, write a news article that matches the writing complexity of " + cefr + " on the CEFR scale. ")
	sb.WriteString(cefrPrompts[cefr] + " ")
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
	log.Println("Result")
	return result, nil
}