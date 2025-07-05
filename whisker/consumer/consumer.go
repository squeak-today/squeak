package consumer

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"sync"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
	sqstypes "github.com/aws/aws-sdk-go-v2/service/sqs/types"

	"whisker/types"
	"whisker/worker"
)

const (
	MAX_NUMBER_OF_MESSAGES = int32(1)
	LONG_POLL_TIMEOUT      = int32(20)
	VISIBILITY_TIMEOUT     = int32(10) // int32(5 * 60)
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

func (c *Consumer) getQueueSize(ctx context.Context) (int32, error) {
	attrs, err := c.client.GetQueueAttributes(ctx, &sqs.GetQueueAttributesInput{
		QueueUrl: &c.queueURL,
		AttributeNames: []sqstypes.QueueAttributeName{
			sqstypes.QueueAttributeNameApproximateNumberOfMessages,
			sqstypes.QueueAttributeNameApproximateNumberOfMessagesNotVisible,
		},
	})
	if err != nil {
		return 0, err
	}

	visible := 0
	if val, ok := attrs.Attributes["ApproximateNumberOfMessages"]; ok {
		if n, err := parseInt32(val); err == nil {
			visible = int(n)
		}
	}

	inFlight := 0
	if val, ok := attrs.Attributes["ApproximateNumberOfMessagesNotVisible"]; ok {
		if n, err := parseInt32(val); err == nil {
			inFlight = int(n)
		}
	}

	return int32(visible + inFlight), nil
}

func parseInt32(s string) (int32, error) {
	var n int32
	_, err := fmt.Sscanf(s, "%d", &n)
	return n, err
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
			output, err := c.client.ReceiveMessage(ctx, &sqs.ReceiveMessageInput{
				QueueUrl:            &c.queueURL,
				MaxNumberOfMessages: MAX_NUMBER_OF_MESSAGES,
				WaitTimeSeconds:     LONG_POLL_TIMEOUT,
				VisibilityTimeout:   VISIBILITY_TIMEOUT,
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

				if err := types.ValidateContentJob(&jobRequest.Job); err != nil {
					log.Printf("Invalid message format: %v", err)
					c.deleteMessage(ctx, msg.ReceiptHandle)
					continue
				}

				queueSize, err := c.getQueueSize(ctx)
				if err != nil {
					log.Printf("Warning: Could not get queue size: %v", err)
				}

				log.Printf("Processing job: %+v (Queue size: %d)", jobRequest, queueSize)

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
