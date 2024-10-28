package main

// https://github.com/cohere-ai/cohere-go
// https://docs.cohere.com/v2/docs/cohere-works-everywhere#cohere-platform
// COHERE_API_KEY="api-key" go run .

// compile to binary
// GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap .
// MUST BE NAMED BOOSTRAP FOR THE NEW provided.al2 RUNTIME
// zip function.zip bootstrap

import (
    "context"
    "log"
    "github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context) error {
    log.Println("Executing Aya Story Generation...")

    story, err := generateStory("French", "B2", "Stephen Curry")
    if err == nil {
        log.Println("Story:", story)
    } else {
        log.Println(err)
    }

    return err
}

func main() {
    lambda.Start(handler)
}