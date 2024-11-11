package main

import (
	"os"
	"encoding/json"
	"net/http"
	"io"
	"errors"
	"bytes"
	"log"
)

type Result struct {
	Title string `json:"title"`
	URL string `json:"url"`
	Content string `json:"content"`
	Score float64 `json:"score"`
}

type TavilyResponse struct {
	Query string `json:"query"`
	Results []Result
}

func webSearch(query string) (TavilyResponse, error) {
	tavilyAPIKey := os.Getenv("TAVILY_API_KEY")
	emptyResponse := TavilyResponse{}

	if tavilyAPIKey == "" { return emptyResponse, errors.New("ERR: TAVILY_API_KEY environment variable not set") }

	tavilyPayload := map[string]interface{}{
		"api_key": tavilyAPIKey,
		"query": query,
		"topic": "news",
		"days": 1,
		"include_answer": false,
		"include_images": false,
		"include_image_descriptions": false,
		"include_raw_content": false,
		"max_results": 3,
		"include_domains": make([]string, 0),
		"exclude_domains": make([]string, 0),
	}

	log.Println("Marshalling Tavily Payload")
	jsonData, err := json.Marshal(tavilyPayload)
    if err != nil { return emptyResponse, err }
	req, err := http.NewRequest("POST", "https://api.tavily.com/search", bytes.NewBuffer(jsonData))
    if err != nil { return emptyResponse, err }

	req.Header.Set("Content-Type", "application/json")

	log.Println("Comitting REQ")
	client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil { return emptyResponse, err }
    defer resp.Body.Close()
	log.Println("RECEIVE RESPONSE")

	body, err := io.ReadAll(resp.Body)
    if err != nil { return emptyResponse, err }

	var result TavilyResponse
	if err := json.Unmarshal(body, &result); err != nil {
		log.Println(string(body))
		return emptyResponse, err
	}
	log.Println("Result")
	log.Println(string(body))
	return result, nil

}
