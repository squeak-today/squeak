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
    "github.com/aws/aws-lambda-go/lambda"

    "time"
    "strings"
)


/*
News Articles haven't been added.
But functionality is like this:

query := "today investing news"
resp, _ := webSearch(query, 20)
web_results := buildInfoBlockFromTavilyResponse(resp)
newsResp, _ := generateNewsArticle("French", "C2", query, web_results)
log.Println(newsResp.Text)
*/
func handler(ctx context.Context) error {
    log.Println("Executing Aya Story Generation...")

    languages := []string{"French"}
	language_ids := map[string]string{
		"French": "fr",
	}
    cefrLevels := []string{"B1", "B2"}
    subjects := []string{"Basketball", "Acting", "Olympics", "Painting"}

    // generate web results
	webResults := make(map[string]string)
	for i := 0; i < len(subjects); i++ {
		subject := subjects[i]
		resp, _ := webSearch("today " + subject + " news", 20)
		webResults[subject] = buildInfoBlockFromTavilyResponse(resp)
	}

    // o(a*6*b*3), so maybe considering increasing lambda timeout
    for i := 0; i < len(languages); i++ {
        for j := 0; j < len(cefrLevels); j++ {
			for k := 0; k < len(subjects); k++ {
				
				// Story Generation
				storyResponse, err := generateStory(languages[i], cefrLevels[j], subjects[k])
    
				if err == nil {
					story := storyResponse.Message.Content[0].Text
					log.Println("Story:", story)

					words, sentences := getWordsAndSentences(story)
					dictionary, _ := generateTranslations(words, sentences, language_ids[languages[i]])
					body, _ := buildStoryBody(story, dictionary)

					current_time := time.Now().UTC().Format("2006-01-02")

					path := strings.ToLower(languages[i]) + "/" + cefrLevels[j] + "/" + subjects[k] + "/" + "Story/"
					push_path := path + cefrLevels[j] + "_Story_" + subjects[k] + "_" + current_time + ".json"
			
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
    }

    return nil
}

func main() {
    lambda.Start(handler)
}