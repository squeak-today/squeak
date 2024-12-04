package main

// SQS_QUEUE_URL="https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>" go run .

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"strconv"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sqs"
)

type GenerationRequest struct {
	Language    string `json:"language"`
	CEFRLevel   string `json:"cefrLevel"`
	Subject     string `json:"subject"`
	ContentType string `json:"contentType"`
}

func handler(ctx context.Context) error {
	queueURL := os.Getenv("SQS_QUEUE_URL")

	sess := session.Must(session.NewSession(&aws.Config{
		Region: aws.String("us-east-2"),
	}))
	sqsSvc := sqs.New(sess)

	languages := []string{"French"}
	cefrLevels := []string{"A1", "A2", "B1", "B2", "C1", "C2"}
	subjects := []string{"Politics"}
	contentTypes := []string{"News"}

	var batch []*sqs.SendMessageBatchRequestEntry
	batchSize := 0

	for _, language := range languages {
		for _, cefrLevel := range cefrLevels {
			for _, subject := range subjects {
				for _, contentType := range contentTypes {
					message := GenerationRequest{
						Language: language,
						CEFRLevel: cefrLevel,
						Subject: subject,
						ContentType: contentType,
					}

					messageBody, err := json.Marshal(message)
					if err != nil {
						log.Printf("Failed to marshal generation request: %v\n", err)
						return err
					}

					// add to batch
					batch = append(batch, &sqs.SendMessageBatchRequestEntry{
						Id: aws.String(strconv.Itoa(len(batch))), // unique ID for the batch entry
						MessageBody: aws.String(string(messageBody)),
					})
					batchSize++

					// send once at max size 10
					if batchSize == 10 {
						err := sendBatch(sqsSvc, queueURL, batch)
						if err != nil {
							return err
						}
						// Reset the batch
						batch = []*sqs.SendMessageBatchRequestEntry{}
						batchSize = 0
					}
				}
			}
		}
	}

	// Send any remaining messages in the batch
	if batchSize > 0 {
		err := sendBatch(sqsSvc, queueURL, batch)
		if err != nil {
			return err
		}
	}

	log.Println("Finished sending messages to SQS")
	return nil
}

// sends a batch of messages to SQS
func sendBatch(sqsSvc *sqs.SQS, queueURL string, batch []*sqs.SendMessageBatchRequestEntry) error {
	_, err := sqsSvc.SendMessageBatch(&sqs.SendMessageBatchInput{
		QueueUrl: aws.String(queueURL),
		Entries:  batch,
	})
	if err != nil {
		log.Printf("Failed to send message batch: %v\n", err)
		return err
	}
	log.Printf("Batch of %d messages sent successfully\n", len(batch))
	return nil
}

func main() {
	lambda.Start(handler)
}