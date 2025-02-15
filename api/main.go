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

	"database/sql"
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

	teacherGroup := router.Group("/teacher")
	{
		teacherGroup.GET("", func(c *gin.Context) {
			userID := getUserIDFromToken(c)
			exists, err := dbClient.GetTeacherInfo(userID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get teacher info"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"exists": exists})
		})

		classroomGroup := teacherGroup.Group("/classroom")
		{
			classroomGroup.GET("", func(c *gin.Context) {
				userID := getUserIDFromToken(c)
				
				classroom_id, students_count, err := dbClient.GetClassroomByTeacherId(userID)
				if err != nil {
					log.Printf("Failed to get classroom: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get classroom"})
					return
				}
				c.JSON(http.StatusOK, gin.H{
					"classroom_id": classroom_id,
					"students_count": students_count,
				})
			})

			classroomGroup.POST("/create", func(c *gin.Context) {
				userID := getUserIDFromToken(c)
				var infoBody struct {
					StudentsCount int `json:"students_count"`
				}
		
				if err := c.ShouldBindJSON(&infoBody); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
					return
				}
	
				classroom_id, err := dbClient.CreateClassroom(userID, infoBody.StudentsCount)
				if err != nil {
					log.Printf("Failed to create classroom: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create classroom"})
					return
				}
	
				c.JSON(http.StatusOK, gin.H{"classroom_id": classroom_id})
			})
		}
	}

	studentGroup := router.Group("/student")
	{
		studentGroup.GET("", func(c *gin.Context) {
			userID := getUserIDFromToken(c)
			studentID, classroomID, err := dbClient.CheckStudentStatus(userID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check student status"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"student_id": studentID, "classroom_id": classroomID})
		})

		classroomGroup := studentGroup.Group("/classroom")
		{
			classroomGroup.GET("", func(c *gin.Context) {
				userID := getUserIDFromToken(c)
				_, classroomID, err := dbClient.CheckStudentStatus(userID)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check student status"})
					return
				}
				teacher_id, students_count, err := dbClient.GetClassroomById(classroomID)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get classroom by ID"})
					return
				}

				c.JSON(http.StatusOK, gin.H{
					"teacher_id": teacher_id,
					"students_count": students_count,
				})
			})

			classroomGroup.POST("/join", func(c *gin.Context) {
				userID := getUserIDFromToken(c)
				var infoBody struct {
					ClassroomID string `json:"classroom_id"`
				}

				if err := c.ShouldBindJSON(&infoBody); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
					return
				}
				
				err := dbClient.AddStudentToClassroom(infoBody.ClassroomID, userID)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add student to classroom"})
					return
				}

				c.JSON(http.StatusOK, gin.H{"message": "Student added to classroom"})
			})
		}
	}


	progressGroup := router.Group("/progress")
	{
		progressGroup.GET("", func(c *gin.Context) {
			userID := getUserIDFromToken(c)

			progress, err := dbClient.GetTodayProgress(userID)
			if err != nil {
				log.Printf("Failed to get progress: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get progress"})
				return
			}

			c.JSON(http.StatusOK, progress)
		})

		progressGroup.GET("/streak", func(c *gin.Context) {
			userID := getUserIDFromToken(c)

			streak, completedToday, err := dbClient.GetProgressStreak(userID)
			if err != nil {
				log.Printf("Failed to get streak: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get streak"})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"streak":          streak,
				"completed_today": completedToday,
			})
		})

		progressGroup.GET("/increment", func(c *gin.Context) {
			userID := getUserIDFromToken(c)
			amount := c.Query("amount")

			if amount == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Amount parameter is required"})
				return
			}

			amountInt, err := strconv.Atoi(amount)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount parameter"})
				return
			}
			if amountInt < 0 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Amount parameter must be non-negative"})
				return
			}

			err = dbClient.IncrementQuestionsCompleted(userID, amountInt)
			if err != nil {
				log.Printf("Failed to increment progress: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to increment progress"})
				return
			}

			progress, err := dbClient.GetTodayProgress(userID)
			if err != nil {
				log.Printf("Failed to get updated progress: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get updated progress"})
				return
			}

			c.JSON(http.StatusOK, progress)
		})
	}

	newsGroup := router.Group("/news")
	{
		newsGroup.GET("", func(c *gin.Context) {
			userID := getUserIDFromToken(c)
			id := c.Query("id")

			if id == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "ID parameter is required"})
				return
			}

			_, classroomID, err := dbClient.CheckStudentStatus(userID);
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check student status"})
				return
			}
			accepted, err := dbClient.CheckAcceptedContent(classroomID, "News", id)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check accepted content"})
				return
			}
			if !accepted {
				c.JSON(http.StatusForbidden, gin.H{"error": "Content not accepted in classroom"})
				return
			}

			// Get the record from supabase db
			contentRecord, err := dbClient.GetContentByID("News", id)
			if err != nil {
				log.Printf("Failed to retrieve content record in DB: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve content"})
				return
			}
			if contentRecord == nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Content not found"})
				return
			}

			// Get the content from s3
			content, err := pullContent(
				contentRecord["language"].(string),
				contentRecord["cefr_level"].(string),
				contentRecord["topic"].(string),
				"News",
				contentRecord["date_created"].(string),
			)
			if err != nil {
				log.Printf("Failed to pull content from S3 bucket: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve content data"})
				return
			}

			response := map[string]interface{}{
				"content_type": "News",
				"language":     contentRecord["language"],
				"cefr_level":   contentRecord["cefr_level"],
				"topic":        contentRecord["topic"],
				"date_created": contentRecord["date_created"],
				"title":        contentRecord["title"],
				"preview_text": contentRecord["preview_text"],
				"content":      content.Content,
				"dictionary":   content.Dictionary,
				"sources":      content.Sources,
			}

			c.JSON(http.StatusOK, response)
		})

		newsGroup.GET("/query", func(c *gin.Context) {
			userID := getUserIDFromToken(c)
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

			params := supabase.QueryParams{
				Language: language,
				CEFR:     cefr,
				Subject:  subject,
				Page:     pageNum,
				PageSize: pageSizeNum,
			}

			_, classroomID, err := dbClient.CheckStudentStatus(userID);
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check student status"})
				return
			}

			if classroomID != "" {
				params.ClassroomID = classroomID
			}

			results, err := dbClient.QueryNews(params)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Query execution failed"})
				return
			}

			c.JSON(http.StatusOK, results)
		})
	}

	storyGroup := router.Group("/story")
	{
		storyGroup.GET("", func(c *gin.Context) {
			userID := getUserIDFromToken(c)
			id := c.Query("id")
			page := c.Query("page")

			if id == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "ID parameter is required"})
				return
			}

			pageNum, err := strconv.Atoi(page)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Page parameter incorrect"})
				return
			}

			_, classroomID, err := dbClient.CheckStudentStatus(userID);
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check student status"})
				return
			}
			accepted, err := dbClient.CheckAcceptedContent(classroomID, "News", id)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check accepted content"})
				return
			}
			if !accepted {
				c.JSON(http.StatusForbidden, gin.H{"error": "Content not accepted in classroom"})
				return
			}

			// Get the record from supabase db
			contentRecord, err := dbClient.GetContentByID("Story", id)
			if err != nil {
				log.Printf("Failed to retrieve content record in DB: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve content"})
				return
			}
			if contentRecord == nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Content not found"})
				return
			}

			// Get the content from s3
			content, err := pullStoryByPage(
				contentRecord["language"].(string),
				contentRecord["cefr_level"].(string),
				contentRecord["topic"].(string),
				contentRecord["id"].(string),
				pageNum,
			)
			if err != nil {
				log.Printf("Failed to pull story by page: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve content data"})
				return
			}

			response := map[string]interface{}{
				"content_type": "Story",
				"language":     contentRecord["language"],
				"cefr_level":   contentRecord["cefr_level"],
				"topic":        contentRecord["topic"],
				"date_created": contentRecord["date_created"],
				"title":        contentRecord["title"],
				"preview_text": contentRecord["preview_text"],
				"content":      content.Content,
				"pages":        contentRecord["pages"],
			}

			c.JSON(http.StatusOK, response)
		})

		storyGroup.GET("/context", func(c *gin.Context) {
			id := c.Query("id")

			if id == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "ID parameter is required"})
				return
			}

			// Get the record from supabase db
			contentRecord, err := dbClient.GetContentByID("Story", id)
			if err != nil {
				log.Printf("Failed to retrieve content record in DB: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve content"})
				return
			}
			if contentRecord == nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Content not found"})
				return
			}

			// Get the context from s3
			context, err := pullStoryQNAContext(
				contentRecord["language"].(string),
				contentRecord["cefr_level"].(string),
				contentRecord["topic"].(string),
				contentRecord["id"].(string),
			)
			if err != nil {
				log.Printf("Failed to pull story context: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve context data"})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"context": context,
			})
		})

		storyGroup.GET("/query", func(c *gin.Context) {
			userID := getUserIDFromToken(c)
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

			params := supabase.QueryParams{
				Language: language,
				CEFR:     cefr,
				Subject:  subject,
				Page:     pageNum,
				PageSize: pageSizeNum,
			}

			_, classroomID, err := dbClient.CheckStudentStatus(userID);
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check student status"})
				return
			}

			if classroomID != "" {
				params.ClassroomID = classroomID
			}
			results, err := dbClient.QueryStories(params)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Query execution failed"})
				return
			}

			c.JSON(http.StatusOK, results)
		})
	}

	profileGroup := router.Group("/profile")
	{
		profileGroup.GET("", func(c *gin.Context) {
			userID := getUserIDFromToken(c)

			profile, err := dbClient.GetProfile(userID)
			if err != nil {
				if err == sql.ErrNoRows {
					c.JSON(http.StatusNotFound, gin.H{
						"error": "Failed to retrieve profile",
						"code":  "PROFILE_NOT_FOUND",
					})
					return
				}
				log.Printf("Failed to retrieve profile: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve profile"})
				return
			}

			c.JSON(http.StatusOK, profile)
		})

		profileGroup.POST("/upsert", func(c *gin.Context) {
			userID := getUserIDFromToken(c)

			var profile Profile
			if err := c.ShouldBindJSON(&profile); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
				return
			}

			if profile.Username == "" || profile.LearningLanguage == "" || profile.SkillLevel == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Username, learning language, and skill level are required"})
				return
			}

			id, err := dbClient.UpsertProfile(userID, &profile)
			if err != nil {
				log.Println(err)
				if strings.Contains(err.Error(), "unique constraint") {
					c.JSON(http.StatusConflict, gin.H{"error": "Username already taken"})
					return
				}
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save profile"})
				return
			}

			c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully", "id": id})
		})
	}

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
