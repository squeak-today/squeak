package storage

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type AlignmentInfo struct {
	Characters []string  `json:"characters"`
	StartTimes []float64 `json:"character_start_times_seconds"`
	EndTimes   []float64 `json:"character_end_times_seconds"`
}

type Audiobook struct {
	Text                string        `json:"text"`
	Audio               string        `json:"audio_base64"`
	Alignment           AlignmentInfo `json:"alignment"`
	NormalizedAlignment AlignmentInfo `json:"normalized_alignment"`
}

func GetAudiobookKey(language string, cefr string, subject string, date string, page int, contentType string) string {
	return fmt.Sprintf("%s/%s/%s/%s/audiobook_%d_%s_%s_%s_%s.json",
		strings.ToLower(language),
		strings.ToUpper(cefr),
		strings.Title(subject),
		contentType,
		page,
		strings.ToUpper(cefr),
		contentType,
		strings.Title(subject),
		date,
	)
}

func GetPresignedURL(key string, expirationMinutes int32) (string, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-east-2"))
	if err != nil {
		log.Printf("unable to load SDK config, %v", err)
		return "", err
	}

	client := s3.NewFromConfig(cfg)
	presignClient := s3.NewPresignClient(client)

	presignedURL, err := presignClient.PresignGetObject(context.TODO(),
		&s3.GetObjectInput{
			Bucket: aws.String(os.Getenv("STORY_BUCKET_NAME")),
			Key:    aws.String(key),
		},
		s3.WithPresignExpires(time.Duration(expirationMinutes)*time.Minute),
	)
	if err != nil {
		log.Printf("error getting presigned URL: %v", err)
		return "", err
	}

	return presignedURL.URL, nil
}
