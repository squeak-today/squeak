package main

import (
	"os"
	"errors"
	"encoding/json"
	"bytes"
	"net/http"
	"io"
	"log"
	"strings"

	"fmt"
)

var GCP_API_BATCH_SIZE = 128

type StoryDictionary struct {
	Translations struct {
		Words map[string]string `json:"words"`
		Sentences map[string]string `json:"sentences"`
	} `json:"translations"`
}

type TranslateResponse struct {
	Data struct {
		Translations []struct {
			TranslatedText string `json:"translatedText"`
		} `json:"translations"`
	} `json:"data"`
}

func getWordsAndSentences(story string) ([]string, []string) {
	words := strings.Split(story, " ")
	sentences := strings.Split(story, ".")
	return words, sentences
}

// limited to languages using , and . and space as separators, so this needs to be modified for e.g Chinese
func batchTranslate(source []string, language string) (map[string]string, error) {
	dict := make(map[string]string)

	googleAPIKey := os.Getenv("GOOGLE_API_KEY")
	if googleAPIKey == "" { return dict, errors.New("ERR: GOOGLE_API_KEY environment variable not set") }

	// o(n*m)???
	var new_source []string
	for _, word := range source {
		trimmedWord := strings.Trim(word, " .\n,")
		splitWords := strings.Split(trimmedWord, "\n")
		for _, splitWord := range splitWords {
			new_source = append(new_source, strings.Trim(splitWord, " .\n,"))
		}
	}

	pointer := 0
	for (pointer < len(new_source)) {
		end_pointer := min(pointer + GCP_API_BATCH_SIZE, len(new_source))

		translatePayload := map[string]interface{}{
			"q": new_source[pointer:end_pointer],
			"source": language,
			"target": "en",
			"format": "text",
		}

		jsonData, err := json.Marshal(translatePayload)
		if err != nil { return dict, err }

		req, err := http.NewRequest("POST", "https://translation.googleapis.com/language/translate/v2?key=" + googleAPIKey, bytes.NewBuffer(jsonData))
		if err != nil { return dict, err }

		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil { return dict, err }
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		log.Println(string(body))
		if err != nil { return dict, err }

		var result TranslateResponse
		if err := json.Unmarshal(body, &result); err != nil {
			log.Println(string(body))
			return dict, err
		}

		if len(result.Data.Translations) > 0 {
			for i := range len(result.Data.Translations) {
				dict[new_source[pointer + i]] = result.Data.Translations[i].TranslatedText
			}
		} else {
			log.Println("No translations found in the response")
			return dict, fmt.Errorf("no translations found")
		}
		pointer = end_pointer
	}
	
	return dict, nil
}

func generateTranslations(words []string, sentences []string, language string) (StoryDictionary, error) {
	dict := StoryDictionary{}
	dict.Translations.Words, _ = batchTranslate(words, language)
	dict.Translations.Sentences, _ = batchTranslate(sentences, language)
	return dict, nil
}