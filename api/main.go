package main

import (
	"os"
	"context"
	"time"
	"strings"
	"log"
	"io"
	"fmt"
	"encoding/json"
	"github.com/aws/aws-sdk-go-v2/aws"
    "github.com/aws/aws-sdk-go-v2/config"
    "github.com/aws/aws-sdk-go-v2/service/s3"
)

// STORY_BUCKET_NAME="story-generation-bucket-dev" go run .

// matches struct in lambda (data.go)
type Story struct {
	Content string `json:"story"`
}


func main() {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-east-2"))
	
	if err != nil {
		log.Fatalf("unable to load SDK config, %v", err)
	}

	client := s3.NewFromConfig(cfg)

	current_time := time.Now().UTC().Format("2006-01-02")
	key := strings.ToLower("French") + "/" + "B1" + "_" + current_time + ".json"

	resp, err := client.GetObject(context.TODO(), &s3.GetObjectInput{
    	Bucket: aws.String(os.Getenv("STORY_BUCKET_NAME")),
    	Key:    aws.String(key),
    })
	if err != nil {
		log.Println(err)
		// return err
	}
	defer resp.Body.Close()

	var builder strings.Builder
	_, err = io.Copy(&builder, resp.Body)
	if err != nil {
		log.Println(err)
		// return err
	}

	var story Story
    err = json.Unmarshal([]byte(builder.String()), &story)
    if err != nil {
        log.Printf("failed to unmarshal JSON: %v", err)
    }

	fmt.Println("Story Content:", story.Content)

}
