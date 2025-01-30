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

	"database/sql"

	_ "github.com/lib/pq"

	"story-gen-lambda/gemini"
)

type GenerationRequest struct {
	Language string `json:"language"`
	CEFRLevel string `json:"cefrLevel"`
	Subject string `json:"subject"`
	ContentType string `json:"contentType"`
}

func supabaseInsertContent(db *sql.DB, table string, title, language, topic, cefrLevel, preview_text string) error {
	query := fmt.Sprintf(`
        INSERT INTO %s (title, language, topic, cefr_level, preview_text, created_at, date_created)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT ON CONSTRAINT unique_%s_entry
        DO UPDATE SET
            title = EXCLUDED.title,
            preview_text = EXCLUDED.preview_text,
            created_at = NOW()
    `, table, table)

    _, err := db.Exec(query, title, language, topic, cefrLevel, preview_text)
    if err != nil {
        return fmt.Errorf("failed to insert news: %v", err)
    }
    
    return nil
}

// temp helper. for now titles are first 30 chars and preview is first 500 chars
func generateTitleAndPreview(text string) (string, string) {
	// use runes instead of string slicing, since some characters are multi-byte
    // such as Chinese characters (though this is a temporary solution anyway,
    // and it'll be updated for actual titles at some point.)
	runes := []rune(text)
	first30 := text
	previewText := text
	if len(runes) > 30 { first30 = string(runes[:40]) }
	if len(runes) > 500 { previewText = string(runes[:500]) }
	first30 = first30 + "..."
	previewText = previewText + "..."
	return first30, previewText
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

	// generate web results
	webResults := make(map[string]string)
	webSources := make(map[string][]Result)
	for i := 0; i < len(generationRequests); i++ {
		subject := generationRequests[i].Subject
		resp, _ := webSearch("today " + subject + " news", 20)
		webSources[subject] = resp.Results
		webResults[subject] = buildInfoBlockFromTavilyResponse(resp)
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
		contentType := genRequest.ContentType
					
		// Story Generation
		if (contentType == "Story") {
			story, err := geminiClient.GenerateStory(language, CEFRLevel, subject)

			if err == nil {
				log.Println("Story:", story)

				words, sentences := getWordsAndSentences(story)
				dictionary := blankStoryDictionary
				if providingTranslations {
					dictionary, _ = generateTranslations(words, sentences, language_ids[language])
				}
				body, _ := buildStoryBody(story, dictionary)

				current_time := time.Now().UTC().Format("2006-01-02")

				path := strings.ToLower(language) + "/" + CEFRLevel + "/" + subject + "/" + "Story/"
				push_path := path + CEFRLevel + "_Story_" + subject + "_" + current_time + ".json"

				if err := uploadStoryS3(
					os.Getenv("STORY_BUCKET_NAME"),
					push_path, body,
				); err != nil {
					log.Println(err)
					return err
				}

				first30, previewText := generateTitleAndPreview(story)
                err := supabaseInsertContent(db, "stories", first30, language, subject, CEFRLevel, previewText)
                if err != nil {
                    log.Println(err)
                    return err
                }
			} else {
				log.Println(err)
				return err
			}
		} else if (contentType == "News") {
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

				first30, previewText := generateTitleAndPreview(newsText)
                err := supabaseInsertContent(db, "news", first30, language, subject, CEFRLevel, previewText)
                if err != nil {
                    log.Println(err)
                    return err
                }
			} else {
				log.Println(err)
				return err
			}
		}
	}

    return nil
}

func main() {
    lambda.Start(handler)
}