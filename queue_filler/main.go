package main

// SQS_QUEUE_URL="https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>" go run .

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"os"

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

func main() {
	queueURL := os.Getenv("SQS_QUEUE_URL")
	if queueURL == "" {
		fmt.Println("Error: SQS_QUEUE_URL environment variable is not set")
		os.Exit(1)
	}

	sess := session.Must(session.NewSession(&aws.Config{
		Region: aws.String("us-east-2"),
	}))
	sqsSvc := sqs.New(sess)

	rand.Seed(60) // this is deprecated? doesn't matter anyways.

	languages := []string{"French", "Spanish"}
	cefrLevels := []string{"A1", "A2", "B1", "B2", "C1", "C2"}
	subjects := []string{"Politics", "Sports", "Arts"}
	contentTypes := []string{"News", "Story"}

	numMessages := 100
	for i := 0; i < numMessages; i++ {
		// Generate a random message
		message := GenerationRequest{
			Language:    languages[rand.Intn(len(languages))],
			CEFRLevel:   cefrLevels[rand.Intn(len(cefrLevels))],
			Subject:     subjects[rand.Intn(len(subjects))],
			ContentType: contentTypes[rand.Intn(len(contentTypes))],
		}

		// Marshal the message into JSON
		messageBody, err := json.Marshal(message)
		if err != nil {
			fmt.Printf("Failed to marshal message: %v\n", err)
			continue
		}

		// Send the message to SQS
		_, err = sqsSvc.SendMessage(&sqs.SendMessageInput{
			QueueUrl:    aws.String(queueURL),
			MessageBody: aws.String(string(messageBody)),
		})
		if err != nil {
			fmt.Printf("Failed to send message: %v\n", err)
		} else {
			fmt.Printf("Message sent: %s\n", string(messageBody))
		}
	}

	fmt.Println("Finished sending messages to SQS")
}