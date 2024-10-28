package main

// https://github.com/cohere-ai/cohere-go
// https://docs.cohere.com/v2/docs/cohere-works-everywhere#cohere-platform
// COHERE_API_KEY="api-key" go run .

import (
    "fmt"
)

func main() {
    story, err := generateStory("French", "B2", "Stephen Curry")
    if err == nil {
        fmt.Println("Story:", story)
    } else {
        fmt.Println(err)
    }
}