package storage

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"os"
	"strings"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type AlignmentInfo struct {
	Characters []string `json:"characters"`
	StartTimes []float64 `json:"character_start_times_seconds"`
	EndTimes   []float64 `json:"character_end_times_seconds"`
}

type Audiobook struct {
	Text string `json:"text"`
	Audio string `json:"audio_base64"`
	Alignment AlignmentInfo `json:"alignment"`
	NormalizedAlignment AlignmentInfo `json:"normalized_alignment"`
}

func buildAudioBookS3Key(language string, cefr string, subject string, date string) string {
	return fmt.Sprintf("%s/%s/%s/%s/audiobook_%s_%s_%s_%s.json",
		strings.ToLower(language),
		strings.ToUpper(cefr),
		strings.Title(subject),
		"News",
		strings.ToUpper(cefr),
		"News",
		strings.Title(subject),
		date,
	)
}

func PullAudiobook(language string, cefr string, subject string, date string) (Audiobook, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-east-2"))
	if err != nil {
		log.Printf("unable to load SDK config, %v", err)
		return Audiobook{}, err
	}

	client := s3.NewFromConfig(cfg)
	key := buildAudioBookS3Key(language, cefr, subject, date)

	resp, err := client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(os.Getenv("STORY_BUCKET_NAME")),
		Key:    aws.String(key),
	})
	if err != nil {
		log.Println(err)
		return Audiobook{}, err
	}
	defer resp.Body.Close()

	var builder strings.Builder
	_, err = io.Copy(&builder, resp.Body)
	if err != nil {
		log.Println(err)
		return Audiobook{}, err
	}

	jsonData := builder.String()
	var audiobook Audiobook
	err = json.Unmarshal([]byte(jsonData), &audiobook)
	if err != nil {
		log.Printf("failed to unmarshal Audiobook JSON: %v", err)
		return Audiobook{}, err
	}
	return audiobook, nil
}