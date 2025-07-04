package producer

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
)

type Producer struct {
	sqsClient *sqs.Client
}

func New(sqsClient *sqs.Client) *Producer {
	return &Producer{
		sqsClient: sqsClient,
	}
}

func (p *Producer) Send(payload any) error {
	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	workspace := os.Getenv("WORKSPACE")
	if workspace != "prod" {
		whiskerURL := os.Getenv("WHISKER_URL")
		if whiskerURL == "" {
			return fmt.Errorf("WHISKER_URL environment variable not set")
		}

		resp, err := http.Post(whiskerURL, "application/json", bytes.NewBuffer(jsonBytes))
		if err != nil {
			return fmt.Errorf("failed to send to Whisker: %w", err)
		}
		defer resp.Body.Close()

		return nil
	}

	queueURL := os.Getenv("SQS_QUEUE_URL")
	if queueURL == "" {
		return fmt.Errorf("SQS_QUEUE_URL environment variable not set")
	}

	_, err = p.sqsClient.SendMessage(context.Background(), &sqs.SendMessageInput{
		QueueUrl:    aws.String(queueURL),
		MessageBody: aws.String(string(jsonBytes)),
	})
	if err != nil {
		return fmt.Errorf("failed to send message to SQS: %w", err)
	}

	return nil
}
