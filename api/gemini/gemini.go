package gemini

import (
	"context"
	"fmt"
	"log"
	"math"
	"strings"
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
	TOP_K                    = 40
	TOP_P                    = 0.95
	MAX_OUTPUT_TOKENS        = 8192

	MAX_RETRIES = 5

	UNDERSTANDING_QUESTION_MODEL       = "gemini-1.5-flash"
	VOCAB_QUESTION_MODEL               = "gemini-1.5-flash"
	UNDERSTANDING_QUESTION_TEMPERATURE = 1.0
	VOCAB_QUESTION_TEMPERATURE         = 0.3
)

// USAGE
// apiKey := os.Getenv("GEMINI_API_KEY")
// geminiClient, err := gemini.NewGeminiClient(apiKey)
//
//	if err != nil {
//		log.Fatalf("Failed to create Gemini client: %v", err)
//	}
//
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

func (c *GeminiClient) ExecutePrompt(model_name string, temperature float32, prompt string) (string, error) {
	ctx := context.Background()

	model := c.Client.GenerativeModel(model_name)
	model.SetTemperature(temperature)
	model.SetTopK(TOP_K)
	model.SetTopP(TOP_P)
	model.SetMaxOutputTokens(MAX_OUTPUT_TOKENS)
	model.ResponseMIMEType = "text/plain"

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

		resp, err := session.SendMessage(ctx, genai.Text(prompt))
		if err == nil {
			result = fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
			return result, nil
		}
		lastErr = err
		log.Printf("Attempt %d failed: %v", attempt+1, err)
	}

	return "", fmt.Errorf("failed after %d attempts, last error: %v", MAX_RETRIES, lastErr)
}

func (c *GeminiClient) EvaluateQNA(cefr string, content string, question string, answer string) (string, error) {
	cleanQuestion := strings.TrimSpace(question)
	if strings.HasPrefix(strings.ToLower(cleanQuestion), "what does") && strings.HasSuffix(strings.ToLower(cleanQuestion), "mean?") {
		prompt := prompts.CreateEvaluateVocabQNAPrompt(cefr, content, question, answer)
		return c.ExecutePrompt(EVALUATE_QNA_MODEL, EVALUATE_QNA_TEMPERATURE, prompt)
	}
	prompt := prompts.CreateEvaluateQNAPrompt(cefr, content, question, answer)
	return c.ExecutePrompt(EVALUATE_QNA_MODEL, EVALUATE_QNA_TEMPERATURE, prompt)
}

func (c *GeminiClient) CreateUnderstandingQuestion(cefr string, content string) (string, error) {
	prompt := prompts.CreateUnderstandingQuestionPrompt(cefr, content)
	return c.ExecutePrompt(UNDERSTANDING_QUESTION_MODEL, UNDERSTANDING_QUESTION_TEMPERATURE, prompt)
}

func (c *GeminiClient) CreateVocabQuestion(cefr string, content string) (string, error) {
	prompt := prompts.CreateVocabQuestionPrompt(cefr, content)
	return c.ExecutePrompt(VOCAB_QUESTION_MODEL, VOCAB_QUESTION_TEMPERATURE, prompt)
}
