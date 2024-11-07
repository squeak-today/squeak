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
)

type v2Response struct {
	Message struct {
		Content []struct {
			Text string `json:"text"`
			Type string `json:"type"`
		} `json:"content"`
	} `json:"message"`
}

func generateStory(language string, cefr string, topic string) (string, error) {
	cohereAPIKey := os.Getenv("COHERE_API_KEY")
	if cohereAPIKey == "" { return "", errors.New("ERR: COHERE_API_KEY environment variable not set") }

	startingMessage := fmt.Sprintf("LANGUAGE: %s\nCEFR: %s\nTOPIC: %s", language, cefr, topic)
	coherePayload := map[string]interface{}{
        "model": "c4ai-aya-expanse-32b",
        "messages": []map[string]string{
            {
                "role": "system",
                "content": 
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
    if err != nil { return "", err }

	req, err := http.NewRequest("POST", "https://api.cohere.com/v2/chat", bytes.NewBuffer(jsonData))
    if err != nil { return "", err }

	req.Header.Set("Accept", "application/json")
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer " + cohereAPIKey)

	client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil { return "", err }
    defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
    if err != nil { return "", err }

    // var result map[string]interface{}
    var result v2Response
    if err := json.Unmarshal(body, &result); err != nil { 
		log.Println(string(body)) // e.g improper model id - should add better reaction
		return "", err
	}

	story := result.Message.Content[0].Text
	return story, nil
}