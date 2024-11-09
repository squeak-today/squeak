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

	"math/rand"
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

var sources = []string{
	"https://www.wsj.com/politics",
	"https://www.theglobeandmail.com",
}

// known problem with runaway responses when Command-R+ is expected to web search, generate, and translate.
// fixed if prompt and message are in the proper language
// THIS FUNCTION SHOULD NOT BE USED (the output is not very good when handling different CEFR levels, also can runaway)
// EXAMPLE USAGE: generateNewsArticle("French", "B1", "today politics news")
func generateNewsArticle(language string, cefr string, query string) (v1Response, error) {
	cohereAPIKey := os.Getenv("COHERE_API_KEY")
	emptyResponse := v1Response{}
	if cohereAPIKey == "" { return emptyResponse, errors.New("ERR: COHERE_API_KEY environment variable not set") }

	startingMessage := fmt.Sprintf("LANGUAGE: %s\nCEFR: %s\nSEARCH QUERY: %s", language, cefr, query)
	randomIndex := rand.Intn(len(sources))
    randomSource := sources[randomIndex]
	coherePayload := map[string]interface{}{
		"chat_history": []map[string]string{
			{
				"role": "system",
				"message": strings.TrimSpace(`
					You are Squeak, an LLM designed to write news articles in certain languages as language learning content.

					You will be provided a language, CEFR level, and search query. 

					First, search the web for news stories. DO NOT MODIFY THE SEARCH QUERY FROM WHAT WAS PROVIDED.
					To write the article, you can only use sources that are from today's date.

					Then, with the found information, you must write a news article in the provided language. The requirements for the news article are as follows:
					- The news article MUST cover a specific event or story relevant to today and use sources only dated to today.
					- The news article must be written in the provided LANGUAGE.
					- The article must be written and formatted as a news article.
					- Write a story that matches the reading difficulty of the provided CEFR level.

					You should provide the story without preamble or other comment.`),
		  	},
		},
		"message": startingMessage,
		"connectors": []map[string]interface{}{
			{
				"id": "web-search",
				"options": map[string]string{
					"site": randomSource,
				},
			},
		},
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

	// log.Println(string(body))
	log.Println(result.Text)
	for i := range len(result.Documents) {
		log.Println(result.Documents[i].URL)
	}
	return result, nil
}