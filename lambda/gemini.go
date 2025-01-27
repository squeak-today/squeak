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

	model := c.client.GenerativeModel("gemini-1.5-flash")
	model.SetTemperature(1)
	model.SetTopK(40)
	model.SetTopP(0.95)
	model.SetMaxOutputTokens(8192)
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

	model := c.client.GenerativeModel("gemini-1.5-flash")
	model.SetTemperature(1)
	model.SetTopK(40)
	model.SetTopP(0.95)
	model.SetMaxOutputTokens(8192)
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
