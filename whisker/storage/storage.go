package storage

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

	whisker "snout/whisker_types"
)

type S3Client struct {
	client *s3.Client
	bucket string
}

func NewS3Client(ctx context.Context) (*S3Client, error) {
	workspace := os.Getenv("WORKSPACE")
	var cfg aws.Config
	var err error

	var bucket string
	if workspace == "prod" || workspace == "dev_sqs_s3" {
		cfg, err = config.LoadDefaultConfig(ctx,
			config.WithRegion(os.Getenv("AWS_REGION")),
		)
		if err != nil {
			return nil, fmt.Errorf("failed to load AWS config: %w", err)
		}
		bucket = os.Getenv("REMOTE_CONTENT_BUCKET_NAME")
	} else {
		cfg, err = config.LoadDefaultConfig(ctx,
			config.WithRegion(os.Getenv("AWS_REGION")),
			config.WithCredentialsProvider(
				aws.CredentialsProviderFunc(func(ctx context.Context) (aws.Credentials, error) {
					return aws.Credentials{
						AccessKeyID:     os.Getenv("S3_USERNAME"),
						SecretAccessKey: os.Getenv("S3_PASSWORD"),
					}, nil
				}),
			),
		)
		if err != nil {
			return nil, fmt.Errorf("failed to load Minio config: %w", err)
		}
		bucket = os.Getenv("CONTENT_BUCKET_NAME")
		log.Printf("Configured S3 client for local Minio")
	}

	if bucket == "" {
		bucket = "squeak-storage"
		log.Printf("Warning: CONTENT_BUCKET_NAME not set, using default: %s", bucket)
	}

	var client *s3.Client
	if workspace == "prod" || workspace == "dev_sqs_s3" {
		client = s3.NewFromConfig(cfg)
	} else {
		client = s3.NewFromConfig(cfg, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(os.Getenv("S3_URL"))
			o.UsePathStyle = true
		})
	}

	s3Client := &S3Client{
		client: client,
		bucket: bucket,
	}

	if err := s3Client.EnsureBucketExists(ctx); err != nil {
		return nil, fmt.Errorf("failed to ensure bucket exists: %w", err)
	}

	log.Printf("S3 Configuration - Bucket: %s, Region: %s",
		os.Getenv("CONTENT_BUCKET_NAME"),
		os.Getenv("AWS_REGION"))

	log.Printf("Successfully connected to S3 using bucket %s in %s environment", bucket, workspace)

	return s3Client, nil
}

func (c *S3Client) GetObject(ctx context.Context, key string) (string, error) {
	log.Printf("Getting object with key: %s", key)
	resp, err := c.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return "", fmt.Errorf("failed to get object: %w", err)
	}
	defer resp.Body.Close()

	var builder strings.Builder
	_, err = io.Copy(&builder, resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read object body: %w", err)
	}

	return builder.String(), nil
}

func (c *S3Client) PutObject(ctx context.Context, key string, content string) error {
	log.Printf("Putting object with key: %s, bucket: %s", key, c.bucket)
	_, err := c.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
		Body:   strings.NewReader(content),
	})
	if err != nil {
		return fmt.Errorf("failed to put object: %w", err)
	}

	return nil
}

func (c *S3Client) PutContent(ctx context.Context, user_id string, content_id string, content whisker.StoredContent) error {
	key := c.ContentKey(user_id, content_id)

	rawContent, err := json.Marshal(content)
	if err != nil {
		return fmt.Errorf("failed to marshal content: %w", err)
	}

	if err := c.PutObject(ctx, key, string(rawContent)); err != nil {
		return fmt.Errorf("failed to put content: %w", err)
	}

	log.Printf("Successfully stored content for user %s with ID %s", user_id, content_id)
	return nil
}

func (c *S3Client) ContentKey(user_id string, content_id string) string {
	return fmt.Sprintf("users/%s/%s.json", user_id, content_id)
}

func (c *S3Client) GetContent(ctx context.Context, user_id string, content_id string) (whisker.StoredContent, error) {
	key := c.ContentKey(user_id, content_id)

	rawContent, err := c.GetObject(ctx, key)
	if err != nil {
		return whisker.StoredContent{}, fmt.Errorf("failed to get content: %w", err)
	}

	var content whisker.StoredContent
	err = json.Unmarshal([]byte(rawContent), &content)
	if err != nil {
		return whisker.StoredContent{}, fmt.Errorf("failed to unmarshal content: %w", err)
	}

	return content, nil
}

func (c *S3Client) EnsureBucketExists(ctx context.Context) error {
	_, err := c.client.HeadBucket(ctx, &s3.HeadBucketInput{
		Bucket: aws.String(c.bucket),
	})

	if err == nil {
		log.Printf("Bucket %s already exists", c.bucket)
		return nil
	}

	log.Printf("Bucket %s does not exist, creating it", c.bucket)
	_, err = c.client.CreateBucket(ctx, &s3.CreateBucketInput{
		Bucket: aws.String(c.bucket),
	})

	if err != nil {
		return fmt.Errorf("failed to create bucket %s: %w", c.bucket, err)
	}

	log.Printf("Successfully created bucket %s", c.bucket)
	return nil
}
