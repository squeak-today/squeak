// Package main API.
//
//	@title						Squeak API
//	@version					1.0
//	@description				Backend API for Squeak Platform
//	@host						api.squeak.today
//	@BasePath					/
//	@securityDefinitions.apiKey	Bearer
//	@in							header
//	@name						Authorization
//	@description				JWT Authorization header using Bearer
package main

import (
	"context"
	"fmt"
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

	"story-api/audio"
	"story-api/gemini"
	"story-api/supabase"

	"story-api/handlers/audiohandler"
	"story-api/handlers/profilehandler"
	"story-api/handlers/progresshandler"
	"story-api/handlers/student"
	"story-api/handlers/teacher"
	"story-api/handlers/newshandler"
	"story-api/handlers/storyhandler"
)

type Profile = supabase.Profile

var ginLambda *ginadapter.GinLambda
var dbClient *supabase.Client

func getUserIDFromToken(c *gin.Context) string {
	value, exists := c.Get("sub")
	if !exists {
		return ""
	}
	if userID, ok := value.(string); ok {
		return userID
	}
	return ""
}

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if os.Getenv("WORKSPACE") == "dev" && c.GetHeader("Authorization") == "Bearer dev-token" {
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

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set("sub", claims["sub"])
			c.Set("email", claims["email"])
		}

		c.Next()
	}
}

func init() {
	log.Println("Gin cold start")

	var err error
	dbClient, err = supabase.NewClient()
	audioClient := audio.NewClient(os.Getenv("GOOGLE_API_KEY"))
	if err != nil {
		log.Fatalf("Failed to initialize database connection: %v", err)
	}

	router := gin.Default()

	AllowOrigin := "*"

	router.Use(func(c *gin.Context) {
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

	teacherHandler := teacher.New(dbClient)
	teacherGroup := router.Group("/teacher")
	{
		teacherGroup.GET("", teacherHandler.CheckTeacherStatus)

		classroomGroup := teacherGroup.Group("/classroom")
		{
			classroomGroup.GET("", teacherHandler.GetClassroomInfo)
			classroomGroup.GET("/content", teacherHandler.QueryClassroomContent)
			classroomGroup.POST("/create", teacherHandler.CreateClassroom)
			classroomGroup.POST("/accept", teacherHandler.AcceptContent)
			classroomGroup.POST("/reject", teacherHandler.RejectContent)
		}
	}

	studentHandler := student.New(dbClient)
	studentGroup := router.Group("/student")
	{
		studentGroup.GET("", studentHandler.CheckStudentStatus)

		classroomGroup := studentGroup.Group("/classroom")
		{
			classroomGroup.GET("", studentHandler.GetClassroomInfo)
			classroomGroup.POST("/join", studentHandler.JoinClassroom)
		}
	}

	audioHandler := audiohandler.New(dbClient, audioClient)
	audioGroup := router.Group("/audio")
	{
		audioGroup.GET("", audioHandler.CheckHealth)
		audioGroup.POST("/translate", audioHandler.Translate)
		audioGroup.POST("/tts", audioHandler.TextToSpeech)
	}

	progressHandler := progresshandler.New(dbClient)
	progressGroup := router.Group("/progress")
	{
		progressGroup.GET("", progressHandler.GetTodayProgress)
		progressGroup.GET("/streak", progressHandler.GetStreak)
		progressGroup.GET("/increment", progressHandler.IncrementProgress)
	}

	profileHandler := profilehandler.New(dbClient)
	profileGroup := router.Group("/profile")
	{
		profileGroup.GET("", profileHandler.GetProfile)
		profileGroup.POST("/upsert", profileHandler.UpsertProfile)
	}

	newsHandler := newshandler.New(dbClient)
	newsGroup := router.Group("/news")
	{
		newsGroup.GET("", newsHandler.GetNews)
		newsGroup.GET("/query", newsHandler.GetNewsQuery)
	}

	storyHandler := storyhandler.New(dbClient)
	storyGroup := router.Group("/story")
	{
		storyGroup.GET("", storyHandler.GetStoryPage)
		storyGroup.GET("/context", storyHandler.GetStoryQNAContext)
		storyGroup.GET("/query", storyHandler.GetStoryQuery)
	}

	qnaGroup := router.Group("/qna")
	{
		qnaGroup.POST("", func(c *gin.Context) {
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

			questionData, err := dbClient.GetContentQuestion(infoBody.ContentType, infoBody.ID, infoBody.QuestionType, infoBody.CEFRLevel)
			if err != nil {
				log.Printf("Failed to retrieve question: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve question"})
				return
			}

			if questionData == nil {
				if infoBody.ContentType == "Story" {
					c.JSON(http.StatusNotFound, gin.H{"error": "No questions found for this story!"})
					return
				}

				// Step 1: Get the record from supabase db
				contentRecord, err := dbClient.GetContentByID(infoBody.ContentType, infoBody.ID)
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
				contentString := contentData.Content

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
				err = dbClient.CreateContentQuestion(infoBody.ContentType, infoBody.ID, infoBody.QuestionType, infoBody.CEFRLevel, generatedQuestion)
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

		qnaGroup.POST("/evaluate", func(c *gin.Context) {
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
				"evaluation":  evaluationScore,
				"explanation": explanation,
			})
		})
	}

	ginLambda = ginadapter.New(router)
}

func Handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return ginLambda.ProxyWithContext(ctx, req)
}

func main() {
	lambda.Start(Handler)
}
