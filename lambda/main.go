package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"strings"
	"time"
	"strconv"

	"database/sql"

	_ "github.com/lib/pq"

	"story-gen-lambda/gemini"
	"story-gen-lambda/stripmd"
)

type GenerationRequest struct {
	Language string `json:"language"`
	CEFRLevel string `json:"cefrLevel"`
	Subject string `json:"subject"`
	ContentType string `json:"contentType"`
}

func buildInfoBlockFromNewsSources(sources []Result) string {
	var sb strings.Builder

	for i := range len(sources) {
		source := sources[i]
		sb.WriteString("SOURCE " + strconv.Itoa(i) + ": " + source.URL + "\n")
		sb.WriteString("TITLE: " + source.Title + "\n")
		sb.WriteString("CONTENT: " + source.Content + "\n")
		sb.WriteString("RELEVANCE: " + strconv.FormatFloat(float64(source.Score), 'f', -1, 64) + "%\n")
	}

	return sb.String()
}

func generateTitleAndPreview(text string) (string, string) {
	rawText := stripmd.Strip(text)

	title := strings.Split(rawText, "\n")[0]
	titleRunes := []rune(title)
	if len(titleRunes) > 140 { title = string(titleRunes[:140]) + "..." }

	previewText := rawText
	rawTextRunes := []rune(rawText)
	if len(rawTextRunes) > 500 { previewText = string(rawTextRunes[:500]) + "..." }
	return title, previewText
}

func handler(ctx context.Context, sqsEvent events.SQSEvent) error {
    log.Println("IX 5: Executing Aya Story Generation...")
	log.Println("Processing SQS Events of length ", len(sqsEvent.Records))

    connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=require",
        os.Getenv("SUPABASE_HOST"),
		os.Getenv("SUPABASE_PORT"),
        os.Getenv("SUPABASE_USER"),
        os.Getenv("SUPABASE_PASSWORD"),
        os.Getenv("SUPABASE_DATABASE"),
    )

    db, err := sql.Open("postgres", connStr)
    if err != nil {
        log.Println("Database connection failed:", err)
		return err
    }
    log.Println("Supabase connection success!")
    defer db.Close()

	language_ids := map[string]string{
		"French": "fr",
		"Spanish": "es",
	}

	providingTranslations := false
	blankStoryDictionary := StoryDictionary{
		Translations: struct {
			Words     map[string]string `json:"words"`
			Sentences map[string]string `json:"sentences"`
		}{
			Words:     make(map[string]string),
			Sentences: make(map[string]string),
		},
	}

	generationRequests := []GenerationRequest{}
	for _, message := range sqsEvent.Records {
		var request GenerationRequest
		err := json.Unmarshal([]byte(message.Body), &request)
		if err != nil {
			log.Println("Failed to parse message: ", err)
			continue
		}
		generationRequests = append(generationRequests, request)
	}
	log.Printf("Finished processing SQS Events of length %d with a final length of %d", len(sqsEvent.Records), len(generationRequests))

	// pull news sources from supabase
	supabaseClient, err := NewClient()
	if err != nil {
		log.Println("Failed to create supabase client:", err)
		return err
	}
	defer supabaseClient.Close()

	webResults := make(map[string]string)
	webSources := make(map[string][]Result)
	for i := 0; i < len(generationRequests); i++ {
		subject := generationRequests[i].Subject
		sources, err := supabaseClient.GetCurrentNewsSources(subject)
		if err != nil {
			log.Println("Failed to get news sources:", err)
			return err
		}
		infoBlock := buildInfoBlockFromNewsSources(sources)
		webSources[subject] = sources
		webResults[subject] = infoBlock
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	geminiClient, err := gemini.NewGeminiClient(apiKey)
	if err != nil {
		log.Println("Failed to create Gemini client:", err)
		return err
	}
	defer geminiClient.Client.Close()

	for _, genRequest := range generationRequests {
		log.Println("Generating story for", genRequest.CEFRLevel)
		language := genRequest.Language
		CEFRLevel := genRequest.CEFRLevel
		subject := genRequest.Subject
					
		// News Generation
		newsText, err := geminiClient.GenerateNewsArticle(language, CEFRLevel, "today " + subject + " news", webResults[subject])

		if err == nil {
			words, sentences := getWordsAndSentences(newsText)
			dictionary := blankStoryDictionary
			if providingTranslations {
				dictionary, _ = generateTranslations(words, sentences, language_ids[language])
			}
			body, _ := buildNewsBody(newsText, dictionary, webSources[subject])

			current_time := time.Now().UTC().Format("2006-01-02")

			path := strings.ToLower(language) + "/" + CEFRLevel + "/" + subject + "/" + "News/"
			push_path := path + CEFRLevel + "_News_" + subject + "_" + current_time + ".json"

			if err := uploadStoryS3(
				os.Getenv("STORY_BUCKET_NAME"),
				push_path, body,
			); err != nil {
				log.Println(err)
				return err
			}

			title, previewText := generateTitleAndPreview(newsText)
			err := supabaseClient.InsertNews(title, language, subject, CEFRLevel, previewText)
			if err != nil {
				log.Println(err)
				return err
			}
		} else {
			log.Println(err)
			return err
		}
	}

    return nil
}

func main() {
    lambda.Start(handler)
}