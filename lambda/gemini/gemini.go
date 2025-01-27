package gemini

import (
	"context"
	"fmt"
	"log"
	"math"
	"time"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"

	"story-gen-lambda/prompts"
)

type GeminiClient struct {
	apiKey string
	Client *genai.Client
}

const (
	STORY_MODEL = "gemini-1.5-pro"
	NEWS_MODEL  = "gemini-1.5-pro"

	STORY_TEMPERATURE = 1.5
	NEWS_TEMPERATURE  = 1.2
	TOP_K             = 40
	TOP_P             = 0.95
	MAX_OUTPUT_TOKENS = 8192

	MAX_RETRIES = 3
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
		apiKey: apiKey,
		Client: client,
	}, nil
}

func (c *GeminiClient) GenerateStory(language string, cefr string, topic string) (string, error) {
	ctx := context.Background()

	model := c.Client.GenerativeModel(STORY_MODEL)
	model.SetTemperature(STORY_TEMPERATURE)
	model.SetTopK(TOP_K)
	model.SetTopP(TOP_P)
	model.SetMaxOutputTokens(MAX_OUTPUT_TOKENS)
	model.ResponseMIMEType = "text/plain"

	startingMessage := prompts.CreateStoryPrompt(language, cefr, topic)

	session := model.StartChat()
	session.History = []*genai.Content{}

	var result string
	var lastErr error

	for attempt := 0; attempt < MAX_RETRIES; attempt++ {
		if attempt > 0 {
			// Exponential backoff: 2^attempt * 100ms
			backoffDuration := time.Duration(math.Pow(2, float64(attempt))) * 100 * time.Millisecond
			time.Sleep(backoffDuration)
		}

		resp, err := session.SendMessage(ctx, genai.Text(startingMessage))
		if err == nil {
			result = fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
			return result, nil
		}
		lastErr = err
		log.Printf("Attempt %d failed: %v", attempt+1, err)
	}

	return "", fmt.Errorf("failed after %d attempts, last error: %v", MAX_RETRIES, lastErr)
}

func (c *GeminiClient) GenerateNewsArticle(language string, cefr string, query string, web_results string) (string, error) {
	ctx := context.Background()

	model := c.Client.GenerativeModel(NEWS_MODEL)
	model.SetTemperature(NEWS_TEMPERATURE)
	model.SetTopK(TOP_K)
	model.SetTopP(TOP_P)
	model.SetMaxOutputTokens(MAX_OUTPUT_TOKENS)
	model.ResponseMIMEType = "text/plain"

	startingMessage := prompts.CreateNewsArticlePrompt(language, cefr, query, web_results)

	session := model.StartChat()
	session.History = []*genai.Content{}

	var result string
	var lastErr error

	for attempt := 0; attempt < MAX_RETRIES; attempt++ {
		if attempt > 0 {
			// Exponential backoff: 2^attempt * 100ms
			backoffDuration := time.Duration(math.Pow(2, float64(attempt))) * 100 * time.Millisecond
			time.Sleep(backoffDuration)
		}

		resp, err := session.SendMessage(ctx, genai.Text(startingMessage))
		if err == nil {
			result = fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
			return result, nil
		}
		lastErr = err
		log.Printf("Attempt %d failed: %v", attempt+1, err)
	}

	return "", fmt.Errorf("failed after %d attempts, last error: %v", MAX_RETRIES, lastErr)
}
