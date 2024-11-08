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

func generateTranslations(words []string, sentences []string, language string) (StoryDictionary, error) {
	dict := StoryDictionary{}
	
	googleAPIKey := os.Getenv("GOOGLE_API_KEY")
	if googleAPIKey == "" { return dict, errors.New("ERR: GOOGLE_API_KEY environment variable not set") }

	allElements := append(words, sentences...)

	translatePayload := map[string]interface{}{
		"q": allElements,
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
		dict.Translations.Words = make(map[string]string)
		for i := range len(words) {
			dict.Translations.Words[words[i]] = result.Data.Translations[i].TranslatedText
		}
		j := 0
		if len(result.Data.Translations) > len(words) { dict.Translations.Sentences = make(map[string]string) }
		for i := len(words); i < len(allElements); i++ {
			dict.Translations.Sentences[sentences[j]] = result.Data.Translations[i].TranslatedText
			j += 1
		}
	} else {
		log.Println("No translations found in the response")
		return dict, fmt.Errorf("no translations found")
	}

	return dict, nil
}

// JUST FOR TESTING, REMOVE LATER
// func main() {
// 	story := `En un histórico regreso político, Donald Trump aseguró la presidencia en las elecciones de 2024, derrotando a la Vicepresidenta Kamala Harris. Esta victoria marca a Trump como el segundo presidente en la historia de Estados Unidos en servir términos no consecutivos, siguiendo a Grover Cleveland en el siglo XIX. Estrategia de Campaña y Apoyo de los Votantes. La campaña de Trump se centró en temas económicos y de inmigración, resonando con un amplio espectro de votantes. Obtuvo un gran apoyo entre votantes rurales blancos y de clase trabajadora, así como un notable respaldo de minorías étnicas. Su énfasis en la recuperación económica y la seguridad nacional conectó con muchos estadounidenses preocupados por estos temas.`
// 	words, sentences := getWordsAndSentences(story)

// 	sd, _ := generateTranslations(words, sentences, "es")
// 	out, _ := json.Marshal(sd)
// 	fmt.Println(string(out))
// }