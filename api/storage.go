package main

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type Story struct {
	Content string `json:"story"`
}

func pullStory(language string, cefrLevel string) (string, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-east-2"))
	
	if err != nil {
		log.Printf("unable to load SDK config, %v", err)
		return "", err
	}

	client := s3.NewFromConfig(cfg)
	current_time := time.Now().UTC().Format("2006-01-02")

	// should probably check if current day files don't exist, then access iteratively yesterday's
	// yesterday := time.Now().UTC().AddDate(0, 0, -1).Format("2006-01-02")

	key := strings.ToLower(language) + "/" + cefrLevel + "_" + current_time + ".json"

	resp, err := client.GetObject(context.TODO(), &s3.GetObjectInput{
    	Bucket: aws.String(os.Getenv("STORY_BUCKET_NAME")),
    	Key: aws.String(key),
    })
	if err != nil {
		log.Println(err)
		return "", err
	}
	defer resp.Body.Close()

	var builder strings.Builder
	_, err = io.Copy(&builder, resp.Body)
	if err != nil {
		log.Println(err)
		return "", nil
	}

	var story Story
    err = json.Unmarshal([]byte(builder.String()), &story)
    if err != nil {
        log.Printf("failed to unmarshal JSON: %v", err)
		return "", err
    }

	return story.Content, nil
}