package main

// SQS_QUEUE_URL="https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>" go run .

import (
	"encoding/json"
	"log"
	"os"
	"context"

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
	cefrLevels := []string{"A1", "B1", "C2"}
	subjects := []string{"Politics"}
	contentTypes := []string{"News", "Story"}

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

					// Marshal the message into JSON
					messageBody, err := json.Marshal(message)
					if err != nil {
						log.Printf("Failed to marshal generation request: %v\n", err)
						return err
					}

					// Send the message to SQS
					_, err = sqsSvc.SendMessage(&sqs.SendMessageInput{
						QueueUrl:    aws.String(queueURL),
						MessageBody: aws.String(string(messageBody)),
					})
					if err != nil {
						log.Printf("Failed to send message: %v\n", err)
						return err
					} else {
						log.Printf("Message sent: %s\n", string(messageBody))
					}
				}
			}
		}
	}
	log.Println("Finished sending messages to SQS")

	return nil
}

func main() {
    lambda.Start(handler)
}