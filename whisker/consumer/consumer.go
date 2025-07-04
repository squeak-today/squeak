package consumer

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"sync"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sqs"

	"whisker/types"
	"whisker/worker"
)

type Consumer struct {
	client   *sqs.Client
	queueURL string
	pool     *worker.Pool
	wg       sync.WaitGroup
	stopChan chan struct{}
}

type SQSMessage struct {
	UserID     string `json:"user_id"`
	DatabaseID string `json:"database_id"`
}

func NewConsumer(ctx context.Context, pool *worker.Pool) (*Consumer, error) {
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
		client:   client,
		queueURL: queueURL,
		pool:     pool,
		stopChan: make(chan struct{}),
	}, nil
}

func (c *Consumer) Start(ctx context.Context) {
	c.wg.Add(1)
	defer c.wg.Done()

	log.Println("Starting SQS consumer...")

	for {
		select {
		case <-ctx.Done():
			log.Println("Consumer shutting down...")
			return
		case <-c.stopChan:
			return
		default:
			visibilityTimeout := int32(35 * 60) // 35 minutes - longer than job timeout (30 min)
			output, err := c.client.ReceiveMessage(ctx, &sqs.ReceiveMessageInput{
				QueueUrl:            &c.queueURL,
				MaxNumberOfMessages: 1,
				WaitTimeSeconds:     20,
				VisibilityTimeout:   visibilityTimeout,
			})
			if err != nil {
				log.Printf("Error receiving message: %v", err)
				continue
			}

			for _, msg := range output.Messages {
				var jobRequest types.ContentJobRequest
				if err := json.Unmarshal([]byte(*msg.Body), &jobRequest); err != nil {
					log.Printf("Error unmarshaling message: %v", err)
					c.deleteMessage(ctx, msg.ReceiptHandle)
					continue
				}

				if err := c.pool.ProcessJob(&jobRequest, func(success bool) {
					if success {
						c.deleteMessage(ctx, msg.ReceiptHandle)
						log.Printf("Message deleted after successful job completion")
					} else {
						log.Printf("Job failed/cancelled, message will return to queue")
					}
				}); err != nil {
					log.Printf("Failed to process job, leaving in queue: %v\n", err)
					continue
				}
			}
		}
	}
}

func (c *Consumer) deleteMessage(ctx context.Context, receiptHandle *string) {
	_, err := c.client.DeleteMessage(ctx, &sqs.DeleteMessageInput{
		QueueUrl:      &c.queueURL,
		ReceiptHandle: receiptHandle,
	})

	if err != nil {
		log.Printf("Error deleting message: %v\n", err)
	}
}

func (c *Consumer) Stop() error {
	close(c.stopChan)
	c.wg.Wait() // Wait for the consumer loop to finish
	return nil
}
