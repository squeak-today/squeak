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
	"net/http"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	"snout/audio"
	models "snout/models"
	"snout/producer"
	"snout/storage"
	"snout/supabase"

	"snout/handlers/audiohandler"
	billing "snout/handlers/billinghandler"
	"snout/handlers/languagehandler"
	"snout/handlers/newshandler"
	"snout/handlers/profilehandler"
	"snout/handlers/progresshandler"
	"snout/handlers/qnahandler"
	"snout/handlers/storyhandler"
	"snout/handlers/stripehandler"
	"snout/handlers/workspaceshandler"
)

type Profile = supabase.Profile

var dbClient *supabase.Client

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if os.Getenv("WORKSPACE") != "prod" && c.GetHeader("Authorization") == "Bearer dev-token" {
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

// @Summary		Get type definitions
// @Description	Returns type definitions for API documentation (not a real endpoint)
// @Tags			types
// @Accept			json
// @Produce		json
// @Success		200	{object}	models.TypesResponse
// @Router			/types [get]
func typesHandler(c *gin.Context) {
	c.JSON(http.StatusOK, models.TypesResponse{})
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found or error loading .env file - using environment variables")
	}

	if os.Getenv("WORKSPACE") == "prod" {
		gin.SetMode(gin.ReleaseMode)
	}

	cfg, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		log.Fatalf("Failed to load AWS configuration: %v", err)
	}
	sqsClient := sqs.NewFromConfig(cfg)

	producer := producer.New(sqsClient)
	s3Client, err := storage.NewS3Client(context.Background())
	if err != nil {
		log.Fatalf("Failed to initialize S3 client: %v", err)
	}

	dbClient, err = supabase.NewClient()
	if err != nil {
		log.Fatalf("Failed to initialize database connection: %v", err)
	}

	audioClient := audio.NewClient(os.Getenv("GOOGLE_API_KEY"), os.Getenv("ELEVENLABS_API_KEY"))

	router := gin.Default()

	AllowOrigin := "*"

	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", AllowOrigin)
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization,Stripe-Signature")
		c.Writer.Header().Set("Access-Control-Max-Age", "3600")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusOK)
			return
		}

		c.Next()
	})

	router.Use(func(c *gin.Context) {
		if c.Request.Method != http.MethodOptions && !strings.HasSuffix(c.Request.URL.Path, "/webhook") {
			authMiddleware()(c)
		}
	})

	// unprotected webhook route
	webhookGroup := router.Group("/webhook")
	{
		stripeHandler := stripehandler.New(dbClient)
		webhookGroup.POST("", stripeHandler.HandleWebhook)
	}

	router.GET("/types", typesHandler)
	billingHandler := billing.New(dbClient)
	billingGroup := router.Group("/billing")
	{
		billingGroup.GET("", billingHandler.GetBillingAccount)
		billingGroup.GET("/usage", billingHandler.GetBillingAccountUsage)
		billingGroup.POST("/create-checkout-session", billingHandler.CreateCheckoutSession)
		billingGroup.POST("/cancel-subscription-eop", billingHandler.CancelSubscriptionAtEndOfPeriod)
	}

	audioHandler := audiohandler.New(dbClient, audioClient)
	audioGroup := router.Group("/audio")
	{
		audioGroup.GET("", audioHandler.CheckHealth)
		audioGroup.GET("/audiobook", audioHandler.GetAudiobook)
	}

	languageHandler := languagehandler.New(dbClient, audioClient)
	languageGroup := router.Group("/language")
	{
		languageGroup.POST("/translate", languageHandler.Translate)
		languageGroup.POST("/tts", languageHandler.TextToSpeech)
		languageGroup.POST("/stt", languageHandler.SpeechToText)
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

	qnaHandler := qnahandler.New(dbClient)
	qnaGroup := router.Group("/qna")
	{
		qnaGroup.POST("", qnaHandler.GetQuestion)
		qnaGroup.POST("/evaluate", qnaHandler.EvaluateAnswer)
	}

	workspacesHandler := workspaceshandler.New(dbClient, producer, s3Client)
	workspacesGroup := router.Group("/workspaces")
	{
		workspacesGroup.GET("", workspacesHandler.GetWorkspaces)
		workspacesGroup.POST("/create", workspacesHandler.CreateWorkspace)
		workspacesGroup.DELETE("/:workspace_id", workspacesHandler.DeleteWorkspace)
		workspacesGroup.GET("/summary", workspacesHandler.GetWorkspacesSummary)
		workspacesGroup.GET("/deleted", workspacesHandler.GetDeletedSummary)

		// /workspaces/{}/databases
		databasesGroup := workspacesGroup.Group("/:workspace_id/databases")
		{
			databasesGroup.POST("/create", workspacesHandler.CreateDatabase)
			databasesGroup.DELETE("/:database_id", workspacesHandler.DeleteDatabase)
			databasesGroup.POST("/:database_id/query", workspacesHandler.QueryDatabase)
		}

		// /workspaces/{}/databases/{}/content
		contentGroup := workspacesGroup.Group("/:workspace_id/databases/:database_id/content")
		{
			contentGroup.POST("/create", workspacesHandler.CreateContent)
			contentGroup.GET("/jobs", workspacesHandler.GetIncompleteJobs)
			contentGroup.GET("/:content_id", workspacesHandler.GetContent)
			contentGroup.DELETE("/:content_id", workspacesHandler.DeleteContent)
		}
	}

	router.Run()
}
