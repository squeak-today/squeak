package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"os"
)

type Result struct {
	Title   string  `json:"title"`
	URL     string  `json:"url"`
	Content string  `json:"content"`
	Score   float64 `json:"score"`
}

type TavilyResponse struct {
	Query   string   `json:"query"`
	Results []Result `json:"results"`
}

type NewsSource struct {
	Topic string `json:"topic"`
	Title string `json:"title"`
	URL string `json:"url"`
	Content string `json:"content"`
	Score int `json:"score"`
}

// EXAMPLE: webSearch("today investing news", 20)
func webSearch(query string, info_depth int) (TavilyResponse, error) {
	tavilyAPIKey := os.Getenv("TAVILY_API_KEY")
	emptyResponse := TavilyResponse{}

	if tavilyAPIKey == "" {
		return emptyResponse, errors.New("ERR: TAVILY_API_KEY environment variable not set")
	}

	tavilyPayload := map[string]interface{}{
		"query":       query,
		"topic":       "general",
		"time_range":  "d",
		"max_results": info_depth,
	}

	log.Println("Marshalling Tavily Payload")
	jsonData, err := json.Marshal(tavilyPayload)
	if err != nil {
		return emptyResponse, err
	}
	req, err := http.NewRequest("POST", "https://api.tavily.com/search", bytes.NewBuffer(jsonData))
	if err != nil {
		return emptyResponse, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+tavilyAPIKey)

	log.Println("Comitting REQ")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return emptyResponse, err
	}
	defer resp.Body.Close()
	log.Println("RECEIVE RESPONSE FOR REQ")

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return emptyResponse, err
	}

	log.Printf("Tavily API Response: %s", string(body))

	var result TavilyResponse
	if err := json.Unmarshal(body, &result); err != nil {
		log.Println(string(body))
		return emptyResponse, err
	}

	return result, nil
}
