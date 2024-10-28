package main

// https://github.com/cohere-ai/cohere-go
// https://docs.cohere.com/v2/docs/cohere-works-everywhere#cohere-platform
// COHERE_API_KEY="api-key" go run main.go

import (
	"bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "os"
	"log"
	"io"
)

func main() {
	cohereAPIKey := os.Getenv("COHERE_API_KEY")
	if cohereAPIKey == "" {
		log.Fatal("COHERE_API_KEY environment variable not set")
	}

	fmt.Println("RUNNING WITH API KEY:", cohereAPIKey)

	coherePayload := map[string]interface{}{
        "model": "command-r-plus-08-2024",
        "messages": []map[string]string{
            {
                "role":    "user",
                "content": "Hello world!",
            },
        },
    }

	jsonData, err := json.Marshal(coherePayload)
    if err != nil {
        fmt.Println("Error marshalling JSON:", err)
        return
    }

	req, err := http.NewRequest("POST", "https://api.cohere.com/v2/chat", bytes.NewBuffer(jsonData))
    if err != nil {
        fmt.Println("Error creating request:", err)
        return
    }

	req.Header.Set("Accept", "application/json")
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer " + cohereAPIKey)

	client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        fmt.Println("Error making POST request:", err)
        return
    }
    defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
    if err != nil {
        fmt.Println("Error reading response body:", err)
        return
    }

	fmt.Println("Response:", string(body))

}