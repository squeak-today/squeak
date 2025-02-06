package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"strconv"
	"strings"

	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	ginadapter "github.com/awslabs/aws-lambda-go-api-proxy/gin"
	"github.com/gin-gonic/gin"

	"github.com/golang-jwt/jwt/v5"
	_ "github.com/lib/pq"

	"story-api/gemini"
	"story-api/supabase"
)

type TranslateResponse struct {
	Data struct {
		Translations []struct {
			TranslatedText string `json:"translatedText"`
		} `json:"translations"`
	} `json:"data"`
}

var ginLambda *ginadapter.GinLambda

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if os.Getenv("WORKSPACE") == "dev" {
			c.Next()
			return
		}

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		bearerToken := strings.Split(authHeader, " ")
		if len(bearerToken) != 2 || strings.ToLower(bearerToken[0]) != "bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		tokenString := bearerToken[1]
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		if !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// if claims, ok := token.Claims.(jwt.MapClaims); ok {
		// 	c.Set("user_claims", claims)
		// }

		c.Next()
	}
}

func init() {
	log.Println("Gin cold start")
	router := gin.Default()

	AllowOrigin := "*"

	router.Use(func(c *gin.Context) {
		// * accepts all origins, change for production
		c.Writer.Header().Set("Access-Control-Allow-Origin", AllowOrigin)
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")
		c.Writer.Header().Set("Access-Control-Max-Age", "3600")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusOK)
			return
		}

		c.Next()
	})

	router.Use(func(c *gin.Context) {
		if c.Request.Method != http.MethodOptions {
			authMiddleware()(c)
		}
	})

	router.GET("/content", func(c *gin.Context) {
		contentType := c.Query("type")
		id := c.Query("id")

		if contentType != "Story" && contentType != "News" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid content type"})
			return
		}

		client, err := supabase.NewClient()
		if err != nil {
			log.Printf("Database connection failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection failed"})
			return
		}
		defer client.Close()

		// Step 1: Get the record from supabase db
		contentRecord, err := client.GetContentByID(contentType, id)
		if err != nil {
			log.Printf("Failed to retrieve content record in DB: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve content"})
			return
		}
		if contentRecord == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Content not found"})
			return
		}

		// Step 2: Get the content from s3
		content, err := pullContent(
			contentRecord["language"].(string),
			contentRecord["cefr_level"].(string),
			contentRecord["topic"].(string),
			contentType,
			contentRecord["date_created"].(string),
		)
		if err != nil {
			log.Printf("Failed to pull content from S3 bucket: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve content data during new question generation"})
			return
		}

		// Step 3: Combine the data
		contentMap := content.ToMap()
		response := map[string]interface{}{
			"content_type": contentType,
			"language":     contentRecord["language"],
			"cefr_level":   contentRecord["cefr_level"],
			"topic":        contentRecord["topic"],
			"date_created": contentRecord["date_created"],
			"title":        contentRecord["title"],
			"preview_text": contentRecord["preview_text"],
		}

		// Add all fields from contentMap to response
		for k, v := range contentMap {
			response[k] = v
		}

		c.JSON(http.StatusOK, response)
	})

	router.GET("/story", func(c *gin.Context) {
		language := c.Query("language")
		cefr := c.Query("cefr")
		subject := c.Query("subject")
		dateCreated := c.Query("date_created")

		if language == "" || cefr == "" || subject == "" || dateCreated == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "language, cefr, subject, and date_created parameter is required!",
			})
			return
		}

		// theres no check for valid language or cefr yet

		content, err := pullContent(language, cefr, subject, "Story", dateCreated)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "content retrieval failed!",
			})
			return
		}

		c.JSON(http.StatusOK, content.ToMap())
	})

	router.GET("/news", func(c *gin.Context) {
		language := c.Query("language")
		cefr := c.Query("cefr")
		subject := c.Query("subject")
		dateCreated := c.Query("date_created")

		if language == "" || cefr == "" || subject == "" || dateCreated == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "language, cefr, subject, and date_created parameter is required!",
			})
			return
		}

		// theres no check for valid language or cefr yet

		content, err := pullContent(language, cefr, subject, "News", dateCreated)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "content retrieval failed!",
			})
			return
		}

		c.JSON(http.StatusOK, content.ToMap())
	})

	router.GET("/news-query", func(c *gin.Context) {
		language := c.Query("language")
		cefr := c.Query("cefr")
		subject := c.Query("subject")
		page := c.Query("page")
		pagesize := c.Query("pagesize")

		if page == "" {
			page = "1"
		}
		if pagesize == "" {
			pagesize = "10"
		}

		pageNum, err := strconv.Atoi(page)
		if err != nil || pageNum < 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid page number"})
			return
		}

		pageSizeNum, err := strconv.Atoi(pagesize)
		if err != nil || pageSizeNum < 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid page size"})
			return
		}

		client, err := supabase.NewClient()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection failed"})
			return
		}
		defer client.Close()

		params := supabase.QueryParams{
			Language: language,
			CEFR:     cefr,
			Subject:  subject,
			Page:     pageNum,
			PageSize: pageSizeNum,
		}

		results, err := client.QueryNews(params)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Query execution failed"})
			return
		}

		c.JSON(http.StatusOK, results)
	})

	router.GET("/story-query", func(c *gin.Context) {
		language := c.Query("language")
		cefr := c.Query("cefr")
		subject := c.Query("subject")
		page := c.Query("page")
		pagesize := c.Query("pagesize")

		if page == "" {
			page = "1"
		}
		if pagesize == "" {
			pagesize = "10"
		}

		pageNum, err := strconv.Atoi(page)
		if err != nil || pageNum < 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid page number"})
			return
		}

		pageSizeNum, err := strconv.Atoi(pagesize)
		if err != nil || pageSizeNum < 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid page size"})
			return
		}

		client, err := supabase.NewClient()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection failed"})
			return
		}
		defer client.Close()

		params := supabase.QueryParams{
			Language: language,
			CEFR:     cefr,
			Subject:  subject,
			Page:     pageNum,
			PageSize: pageSizeNum,
		}

		results, err := client.QueryStories(params)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Query execution failed"})
			return
		}

		c.JSON(http.StatusOK, results)
	})

	router.POST("/translate", func(c *gin.Context) {
		var infoBody struct {
			Sentence string `json:"sentence"`
			Source   string `json:"source"`
			Target   string `json:"target"`
		}

		if err := c.ShouldBindJSON(&infoBody); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		googleAPIKey := os.Getenv("GOOGLE_API_KEY")
		query := []string{infoBody.Sentence}
		translatePayload := map[string]interface{}{
			"q":      query,
			"source": infoBody.Source,
			"target": infoBody.Target,
			"format": "text",
		}

		jsonData, err := json.Marshal(translatePayload)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Translate payload marshalling failed!",
			})
			return
		}

		req, err := http.NewRequest("POST", "https://translation.googleapis.com/language/translate/v2?key="+googleAPIKey, bytes.NewBuffer(jsonData))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Request to GCP failed!",
			})
			return
		}

		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Request to GCP failed!",
			})
			return
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Request to GCP failed!",
			})
			return
		}

		var result TranslateResponse
		if err := json.Unmarshal(body, &result); err != nil {
			log.Println(string(body))
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "TranslateResponse unmarshalling failed!",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"sentence": result.Data.Translations[0].TranslatedText,
		})
	})

	router.POST("/evaluate-qna", func(c *gin.Context) {
		var infoBody struct {
			CEFR     string `json:"cefr"`
			Content  string `json:"content"`
			Question string `json:"question"`
			Answer   string `json:"answer"`
		}

		if err := c.ShouldBindJSON(&infoBody); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		apiKey := os.Getenv("GEMINI_API_KEY")
		geminiClient, err := gemini.NewGeminiClient(apiKey)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create Gemini client: %v", err)})
			return
		}
		defer geminiClient.Client.Close()

		evaluation, err := geminiClient.EvaluateQNA(infoBody.CEFR, infoBody.Content, infoBody.Question, infoBody.Answer)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Evaluation with Gemini failed"})
			return
		}

		// take only first 4 characters of evaluation, as its either PASS or FAIL
		evaluationScore := ""
		if len(evaluation) >= 4 {
			evaluationScore = evaluation[:4]
		} else {
			evaluationScore = evaluation
		}
		
		explanation, err := geminiClient.GenerateQNAExplanation(infoBody.CEFR, infoBody.Content, infoBody.Question, infoBody.Answer, evaluationScore)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Explanation with Gemini failed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"evaluation": evaluationScore,
			"explanation": explanation,
		})
	})

	router.POST("/content-question", func(c *gin.Context) {
		var infoBody struct {
			ContentType  string `json:"content_type"`
			ID           string `json:"id"`
			CEFRLevel    string `json:"cefr_level"`
			QuestionType string `json:"question_type"`
		}

		if err := c.ShouldBindJSON(&infoBody); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		// Validate ContentType
		if infoBody.ContentType != "News" && infoBody.ContentType != "Story" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Content type must be either 'News' or 'Story'"})
			return
		}

		// Validate ID is numeric
		if _, err := strconv.Atoi(infoBody.ID); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID must be a valid number"})
			return
		}

		// Validate Question Type
		if infoBody.QuestionType != "vocab" && infoBody.QuestionType != "understanding" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Question type must be either 'vocab' or 'understanding'"})
			return
		}

		client, err := supabase.NewClient()
		if err != nil {
			log.Printf("Database connection failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection failed"})
			return
		}
		defer client.Close()

		questionData, err := client.GetContentQuestion(infoBody.ContentType, infoBody.ID, infoBody.QuestionType, infoBody.CEFRLevel)
		if err != nil {
			log.Printf("Failed to retrieve question: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve question"})
			return
		}

		if questionData == nil {
			// Step 1: Get the record from supabase db
			contentRecord, err := client.GetContentByID(infoBody.ContentType, infoBody.ID)
			if err != nil {
				log.Printf("Failed to retrieve content record in DB: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve content"})
				return
			}
			if contentRecord == nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Content not found"})
				return
			}

			// Step 2: Get the content from s3
			contentData, err := pullContent(
				contentRecord["language"].(string),
				contentRecord["cefr_level"].(string),
				contentRecord["topic"].(string),
				infoBody.ContentType,
				contentRecord["date_created"].(string),
			)
			if err != nil {
				log.Printf("Failed to pull content from S3 bucket: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve content data during new question generation"})
				return
			}

			var contentString string
			switch v := contentData.(type) {
			case Story:
				contentString = v.Content
			case News:
				contentString = v.Content
			default:
				log.Printf("Invalid content type received: %T", contentData)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid content type"})
				return
			}

			// Step 3: generate the question
			apiKey := os.Getenv("GEMINI_API_KEY")
			geminiClient, err := gemini.NewGeminiClient(apiKey)
			if err != nil {
				log.Printf("Failed to create Gemini client: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize gemini client"})
				return
			}
			defer geminiClient.Client.Close()

			var generatedQuestion string
			var genErr error
			if infoBody.QuestionType == "vocab" {
				generatedQuestion, genErr = geminiClient.CreateVocabQuestion(infoBody.CEFRLevel, contentString)
			} else {
				generatedQuestion, genErr = geminiClient.CreateUnderstandingQuestion(infoBody.CEFRLevel, contentString)
			}
			if genErr != nil {
				log.Printf("Failed to generate question: %v", genErr)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate question"})
				return
			}

			// Step 4: save question to db
			err = client.CreateContentQuestion(infoBody.ContentType, infoBody.ID, infoBody.QuestionType, infoBody.CEFRLevel, generatedQuestion)
			if err != nil {
				log.Printf("Failed to save question to database: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save question to database"})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"question": generatedQuestion,
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"question": questionData["question"],
		})
	})

	ginLambda = ginadapter.New(router)
}

func Handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return ginLambda.ProxyWithContext(ctx, req)
}

func main() {
	lambda.Start(Handler)
}
