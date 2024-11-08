package main

import (
	"os"
	"errors"
	"encoding/json"
	"bytes"
	"net/http"
	"io"
	"log"

	"fmt"
)

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

func generateTranslations(words []string, sentences []string) (StoryDictionary, error) {
	blank := StoryDictionary{}
	
	googleAPIKey := os.Getenv("GOOGLE_API_KEY")
	if googleAPIKey == "" { return blank, errors.New("ERR: GOOGLE_API_KEY environment variable not set") }

	translatePayload := map[string]interface{}{
		"q": []string{
			words[0],
			words[1],
			words[2],
			sentences[0],
		},
		"source": "fr",
		"target": "en",
		"format": "text",
	}

	jsonData, err := json.Marshal(translatePayload)
	if err != nil { return blank, err }

	req, err := http.NewRequest("POST", "https://translation.googleapis.com/language/translate/v2?key=" + googleAPIKey, bytes.NewBuffer(jsonData))
    if err != nil { return blank, err }

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil { return blank, err }
    defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	log.Println(string(body))
    if err != nil { return blank, err }

	var result TranslateResponse
	if err := json.Unmarshal(body, &result); err != nil {
		log.Println(string(body))
		return blank, err
	}

	if len(result.Data.Translations) > 3 {
		blank.Translations.Words = make(map[string]string)
		blank.Translations.Words[words[0]] = result.Data.Translations[0].TranslatedText
		blank.Translations.Words[words[1]] = result.Data.Translations[1].TranslatedText
		blank.Translations.Words[words[2]] = result.Data.Translations[2].TranslatedText
		blank.Translations.Sentences = make(map[string]string)
		blank.Translations.Sentences[sentences[0]] = result.Data.Translations[3].TranslatedText
	} else {
		log.Println("No translations found in the response")
		return blank, fmt.Errorf("no translations found")
	}

	return blank, nil
}

// JUST FOR TESTING, REMOVE LATER
// func main() {
// 	words := make([]string, 3)
// 	words[0] = "bonjour"
// 	words[1] = "alors"
// 	words[2] = "pouvoir"

// 	sentences := make([]string, 1)
// 	sentences[0] = "bonjour, alors, pouvoir c'est la question vrai."

//  sd, _ := generateTranslations(words, sentences)
// 	out, _ := json.Marshal(sd)
// 	fmt.Println(string(out))
// }