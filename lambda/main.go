package main

// https://github.com/cohere-ai/cohere-go
// COHERE_API_KEY="api-key" go run main.go

import (
	"fmt"
	"os"
	"log"
)

func main() {
	cohereAPIKey := os.Getenv("COHERE_API_KEY")
	if cohereAPIKey == "" {
		log.Fatal("COHERE_API_KEY environment variable not set")
	}

	fmt.Println("RUNNING WITH API KEY:", cohereAPIKey)
}