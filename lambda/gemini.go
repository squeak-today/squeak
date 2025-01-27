package main

import (
	"context"
	"fmt"
	"log"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type GeminiClient struct {
	apiKey      string
	client      *genai.Client
}

const (
	STORY_MODEL = "gemini-1.5-pro"
	NEWS_MODEL = "gemini-1.5-pro"

	STORY_TEMPERATURE = 1.5
	NEWS_TEMPERATURE = 1.2
	TOP_K = 40
	TOP_P = 0.95
	MAX_OUTPUT_TOKENS = 8192
)

// USAGE
// apiKey := os.Getenv("GEMINI_API_KEY")
// geminiClient, err := NewGeminiClient(apiKey)
// if err != nil {
// 	log.Fatalf("Failed to create Gemini client: %v", err)
// }
// defer geminiClient.client.Close()

// story, _ := geminiClient.generateStory("French", "B1", "Politics")
// article, _ := geminiClient.generateNewsArticle("French", "B1", "today Politics news", "France's new president is here!")
func NewGeminiClient(apiKey string) (*GeminiClient, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("error creating Gemini client: %v", err)
	}

	return &GeminiClient{
		apiKey:      apiKey,
		client:      client,
	}, nil
}

func (c *GeminiClient) generateStory(language string, cefr string, topic string) (string, error) {
	ctx := context.Background()

	model := c.client.GenerativeModel(STORY_MODEL)
	model.SetTemperature(STORY_TEMPERATURE)
	model.SetTopK(TOP_K)
	model.SetTopP(TOP_P)
	model.SetMaxOutputTokens(MAX_OUTPUT_TOKENS)
	model.ResponseMIMEType = "text/plain"

	startingMessage := createStoryPrompt(language, cefr, topic)

	session := model.StartChat()
	session.History = []*genai.Content{}

	resp, err := session.SendMessage(ctx, genai.Text(startingMessage))
	if err != nil {
		log.Fatalf("Error sending message: %v", err)
		return "", err
	}

	return fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0]), nil
}

func (c *GeminiClient) generateNewsArticle(language string, cefr string, query string, web_results string) (string, error) {
	ctx := context.Background()

	model := c.client.GenerativeModel(NEWS_MODEL)
	model.SetTemperature(NEWS_TEMPERATURE)
	model.SetTopK(TOP_K)
	model.SetTopP(TOP_P)
	model.SetMaxOutputTokens(MAX_OUTPUT_TOKENS)
	model.ResponseMIMEType = "text/plain"

	startingMessage := createNewsArticlePrompt(language, cefr, query, web_results)

	session := model.StartChat()
	session.History = []*genai.Content{}

	resp, err := session.SendMessage(ctx, genai.Text(startingMessage))
	if err != nil {
		log.Fatalf("Error sending message: %v", err)
		return "", err
	}

	return fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0]), nil
}
