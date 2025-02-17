package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"os"

	"strconv"
	"strings"
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

// EXAMPLE: webSearch("today investing news", 20)
func webSearch(query string, info_depth int) (TavilyResponse, error) {
	tavilyAPIKey := os.Getenv("TAVILY_API_KEY")
	emptyResponse := TavilyResponse{}

	if tavilyAPIKey == "" {
		return emptyResponse, errors.New("ERR: TAVILY_API_KEY environment variable not set")
	}

	tavilyPayload := map[string]interface{}{
		"query":       query,
		"topic":       "news",
		"days":        2,
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

func buildInfoBlockFromTavilyResponse(resp TavilyResponse) string {
	var sb strings.Builder

	for i := range len(resp.Results) {
		source := resp.Results[i]
		sb.WriteString("SOURCE " + strconv.Itoa(i) + ": " + source.URL + "\n")
		sb.WriteString("TITLE: " + source.Title + "\n")
		sb.WriteString("CONTENT: " + source.Content + "\n")
		sb.WriteString("RELEVANCE: " + strconv.FormatFloat(source.Score*100.0, 'f', -1, 64) + "%\n")
	}

	return sb.String()
}
