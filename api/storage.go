package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"

	"github.com/gin-gonic/gin"
)

type Content interface {
	ToMap() gin.H
}

func (s Story) ToMap() gin.H {
	return gin.H{
		"content": s.Content,
	}
}

func (n News) ToMap() gin.H {
	return gin.H{
		"content":    n.Content,
		"dictionary": n.Dictionary,
		"sources":    n.Sources,
	}
}

type Dictionary struct {
	Translations struct {
		Words     map[string]string `json:"words"`
		Sentences map[string]string `json:"sentences"`
	} `json:"translations"`
}

// since stories are mostly stored as pages, this type is mostly
// used to represent a single page of a story
type Story struct {
	Content string `json:"story"`
}

type Source struct {
	Title   string  `json:"title"`
	URL     string  `json:"url"`
	Content string  `json:"content"`
	Score   float64 `json:"score"`
}

type News struct {
	Content    string     `json:"article"`
	Dictionary Dictionary `json:"dictionary"`
	Sources    []Source   `json:"sources"`
}

type ContentType string

const (
	StoryType   ContentType = "Story"
	ArticleType ContentType = "Article"
)

func buildS3Key(language string, cefr string, subject string, contentType string, date string) string {
	return fmt.Sprintf("%s/%s/%s/%s/%s_%s_%s_%s.json",
		strings.ToLower(language),
		strings.ToUpper(cefr),
		strings.Title(subject),
		strings.Title(contentType),
		strings.ToUpper(cefr),
		strings.Title(contentType),
		strings.Title(subject),
		date,
	)
}

func pullContent(language string, cefrLevel string, subject string, contentType string, dateCreated string) (News, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-east-2"))
	if err != nil {
		log.Printf("unable to load SDK config, %v", err)
		return News{}, err
	}

	client := s3.NewFromConfig(cfg)
	key := buildS3Key(language, cefrLevel, subject, contentType, dateCreated)

	resp, err := client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(os.Getenv("STORY_BUCKET_NAME")),
		Key:    aws.String(key),
	})
	if err != nil {
		log.Println(err)
		return News{}, err
	}
	defer resp.Body.Close()

	var builder strings.Builder
	_, err = io.Copy(&builder, resp.Body)
	if err != nil {
		log.Println(err)
		return News{}, err
	}

	jsonData := builder.String()
	var news News
	err = json.Unmarshal([]byte(jsonData), &news)
	if err != nil {
		log.Printf("failed to unmarshal News JSON: %v", err)
		return News{}, err
	}
	return news, nil
}

func buildS3PageKey(language string, cefr string, subject string, id string, page int) string {
	return fmt.Sprintf("%s/%s/%s/Story/%s/page%d.mdx",
		strings.ToLower(language),
		strings.ToUpper(cefr),
		strings.Title(subject),
		id,
		page,
	)
}

func pullStoryByPage(language string, cefrLevel string, subject string, id string, page int) (Story, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-east-2"))
	if err != nil {
		log.Printf("unable to load SDK config, %v", err)
		return Story{}, err
	}

	client := s3.NewFromConfig(cfg)
	key := buildS3PageKey(language, cefrLevel, subject, id, page)

	resp, err := client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(os.Getenv("STORY_BUCKET_NAME")),
		Key:    aws.String(key),
	})
	if err != nil {
		log.Printf("failed to get object from S3: %v", err)
		return Story{}, err
	}
	defer resp.Body.Close()

	var builder strings.Builder
	_, err = io.Copy(&builder, resp.Body)
	if err != nil {
		log.Printf("failed to read object body: %v", err)
		return Story{}, err
	}

	return Story{Content: builder.String()}, nil
}

func buildS3QNAContextKey(language string, cefr string, subject string, id string) string {
	return fmt.Sprintf("%s/%s/%s/Story/%s/context.txt",
		strings.ToLower(language),
		strings.ToUpper(cefr),
		strings.Title(subject),
		id,
	)
}

func pullStoryQNAContext(language string, cefrLevel string, subject string, id string) (string, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-east-2"))
	if err != nil {
		log.Printf("unable to load SDK config, %v", err)
		return "", err
	}

	client := s3.NewFromConfig(cfg)
	key := buildS3QNAContextKey(language, cefrLevel, subject, id)

	resp, err := client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(os.Getenv("STORY_BUCKET_NAME")),
		Key:    aws.String(key),
	})
	if err != nil {
		log.Printf("failed to get context.txt from S3: %v", err)
		return "", err
	}
	defer resp.Body.Close()

	var builder strings.Builder
	_, err = io.Copy(&builder, resp.Body)
	if err != nil {
		log.Printf("failed to read context.txt body: %v", err)
		return "", err
	}

	return builder.String(), nil
}
