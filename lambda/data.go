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

// create []byte to pass as Body into uploadStoryS3 from story content and the StoryDictionary
func buildStoryBody(story string, dictionary StoryDictionary) ([]byte, error) {
	storyData := StoryData{
		Story: story,
		Translations: dictionary,
	}
	log.Println("Length of Translations.Words: ", len(dictionary.Translations.Words))
	log.Println("Length of Translations.Sentences: ", len(dictionary.Translations.Sentences))
	log.Printf("%+v\n", dictionary)
	
	jsonContent, err := json.Marshal(storyData)
	if err != nil {
		log.Println("failed to marshal story: %w", err)
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