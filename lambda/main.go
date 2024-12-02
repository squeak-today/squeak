package main

// https://github.com/cohere-ai/cohere-go
// https://docs.cohere.com/v2/docs/cohere-works-everywhere#cohere-platform
// GOOGLE_API_KEY = "api-key" COHERE_API_KEY="api-key" STORY_BUCKET_NAME="story-generation-bucket-dev" go run .

// compile to binary
// GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap .
// MUST BE NAMED BOOSTRAP FOR THE NEW provided.al2 RUNTIME
// zip function.zip bootstrap

import (
    "os"
    "context"
    "log"
	"encoding/json"
	"github.com/aws/aws-lambda-go/lambda"
    "github.com/aws/aws-lambda-go/events"

    "time"
    "strings"
)

type GenerationRequest struct {
	Language string `json:"language"`
	CEFRLevel string `json:"cefrLevel"`
	Subject string `json:"subject"`
	ContentType string `json:"contentType"`
}

func handler(ctx context.Context, sqsEvent events.SQSEvent) error {
    log.Println("Executing Aya Story Generation...")

	language_ids := map[string]string{
		"French": "fr",
	}

	generationRequests := []GenerationRequest{}
	seenSubjects := make(map[string]bool)
	for _, message := range sqsEvent.Records {
		var request GenerationRequest
		err := json.Unmarshal([]byte(message.Body), &request)
		if err != nil {
			log.Println("Failed to parse message: ", err)
			continue
		}
		if !seenSubjects[request.Subject] {
			seenSubjects[request.Subject] = true
			generationRequests = append(generationRequests, request)
		}
	}

	// generate web results
	webResults := make(map[string]string)
	webSources := make(map[string][]Result)
	for i := 0; i < len(generationRequests); i++ {
		subject := generationRequests[i].Subject
		resp, _ := webSearch("today " + subject + " news", 20)
		webSources[subject] = resp.Results
		webResults[subject] = buildInfoBlockFromTavilyResponse(resp)
	}

	for _, genRequest := range generationRequests {
		language := genRequest.Language
		CEFRLevel := genRequest.CEFRLevel
		subject := genRequest.Subject
		contentType := genRequest.ContentType
					
		// Story Generation
		if (contentType == "Story") {
			storyResponse, err := generateStory(language, CEFRLevel, subject)

			if err == nil {
				story := storyResponse.Message.Content[0].Text
				log.Println("Story:", story)

				words, sentences := getWordsAndSentences(story)
				dictionary, _ := generateTranslations(words, sentences, language_ids[language])
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
			} else {
				log.Println(err)
				return err
			}
		} else if (contentType == "News") {
			// News Generation
			newsResp, err := generateNewsArticle(language, CEFRLevel, "today " + subject + " news", webResults[subject])

			if err == nil {
				words, sentences := getWordsAndSentences(newsResp.Text)
				dictionary, _ := generateTranslations(words, sentences, language_ids[language])
				body, _ := buildNewsBody(newsResp.Text, dictionary, webSources[subject])

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