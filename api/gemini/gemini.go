package gemini

import (
	"context"
	"fmt"
	"log"
	"math"
	"time"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"

	"story-api/prompts"
)

type GeminiClient struct {
	apiKey string
	Client *genai.Client
}

const (
	EVALUATE_QNA_MODEL = "gemini-1.5-flash"

	EVALUATE_QNA_TEMPERATURE = 0.3
	TOP_K             = 40
	TOP_P             = 0.95
	MAX_OUTPUT_TOKENS = 8192

	MAX_RETRIES = 5
)

// USAGE
// apiKey := os.Getenv("GEMINI_API_KEY")
// geminiClient, err := gemini.NewGeminiClient(apiKey)
// if err != nil {
// 	log.Fatalf("Failed to create Gemini client: %v", err)
// }
// defer geminiClient.Client.Close()
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

func (c *GeminiClient) EvaluateQNA(cefr string, content string, question string, answer string) (string, error) {
	ctx := context.Background()

	model := c.Client.GenerativeModel(EVALUATE_QNA_MODEL)
	model.SetTemperature(EVALUATE_QNA_TEMPERATURE)
	model.SetTopK(TOP_K)
	model.SetTopP(TOP_P)
	model.SetMaxOutputTokens(MAX_OUTPUT_TOKENS)
	model.ResponseMIMEType = "text/plain"

	startingMessage := prompts.CreateEvaluateQNAPrompt(cefr, content, question, answer)

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
