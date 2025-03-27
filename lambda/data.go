package main

// BUCKET ID FOR UPLOADING STORY
// squeak-library

import (
	"encoding/json"
	"context"
	"log"
	"strings"
	"github.com/aws/aws-sdk-go-v2/aws"
    "github.com/aws/aws-sdk-go-v2/config"
    "github.com/aws/aws-sdk-go-v2/service/s3"
)

type StoryData struct {
	Story string `json:"story"`
	Translations StoryDictionary `json:"dictionary"`
}

type NewsData struct {
	Article string `json:"article"`
	Translations StoryDictionary `json:"dictionary"`
	Sources []Result `json:"sources"`
}

func buildNewsBody(article string, dictionary StoryDictionary, sources []Result) ([]byte, error) {
	newsData := NewsData{
		Article: article,
		Translations: dictionary,
		Sources: sources,
	}
	log.Println("Length of Translations.Words: ", len(dictionary.Translations.Words))
	log.Println("Length of Translations.Sentences: ", len(dictionary.Translations.Sentences))
	log.Printf("%+v\n", dictionary)
	log.Println("Length of Sources: ", len(sources))

	jsonContent, err := json.Marshal(newsData)
	if err != nil {
		log.Println("failed to marshal article data: %w", err)
		emptyBytes := make([]byte, 0)
		return emptyBytes, err
	}

	return jsonContent, nil
}

func uploadStoryS3(bucket string, key string, content []byte) error {
	// unsure if config.WithRegion("us-east-2") is necessary here
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-east-2"))
	if err != nil {
		log.Fatalf("unable to load SDK config, %v", err)
	}

	client := s3.NewFromConfig(cfg)
	_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(bucket),
		Key: aws.String(key),
		Body: strings.NewReader(string(content)),
	})

	if err != nil {
        log.Println("failed to upload story: %w", err)
		return err
    }
	log.Printf("Story uploaded to S3 bucket '%s' with key '%s'", bucket, key)
	return nil
}