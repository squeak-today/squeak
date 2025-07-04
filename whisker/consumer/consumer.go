package consumer

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
)

type Consumer struct {
	sqsClient *sqs.Client
	queueURL  string
}

func NewConsumer(ctx context.Context) (*Consumer, error) {
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, err
	}

	client := sqs.NewFromConfig(cfg)
	queueURL := os.Getenv("SQS_QUEUE_URL")
	if queueURL == "" {
		log.Println("Warning: SQS_QUEUE_URL not set")
	}

	return &Consumer{
		sqsClient: client,
		queueURL:  queueURL,
	}, nil
}

func (c *Consumer) Start(ctx context.Context) {
	log.Println("Starting SQS consumer...")

	for {
		select {
		case <-ctx.Done():
			log.Println("Consumer shutting down...")
			return
		default:
			output, err := c.sqsClient.ReceiveMessage(ctx, &sqs.ReceiveMessageInput{
				QueueUrl:            &c.queueURL,
				MaxNumberOfMessages: 1,
				WaitTimeSeconds:     20, // Long polling
				// NOTE: maybe we should poll also based on available resources internally.
			})

			if err != nil {
				log.Printf("Error receiving message: %v\n", err)
				continue
			}

			for _, msg := range output.Messages {
				log.Printf("Processing message: %s\n", *msg.MessageId)

				_, err := c.sqsClient.DeleteMessage(ctx, &sqs.DeleteMessageInput{
					QueueUrl:      &c.queueURL,
					ReceiptHandle: msg.ReceiptHandle,
				})

				if err != nil {
					log.Printf("Error deleting message: %v\n", err)
				}
			}
		}
	}
}
