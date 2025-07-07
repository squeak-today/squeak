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
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	"snout/audio"
	"snout/supabase"

	"snout/handlers/audiohandler"
	billing "snout/handlers/billinghandler"
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

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found or error loading .env file - using environment variables")
	}

	if os.Getenv("WORKSPACE") == "prod" {
		gin.SetMode(gin.ReleaseMode)
	}

	var err error
	dbClient, err = supabase.NewClient()
	if err != nil {
		log.Fatalf("Failed to initialize database connection: %v", err)
	}

	audioClient := audio.NewClient(os.Getenv("GOOGLE_API_KEY"), os.Getenv("ELEVENLABS_API_KEY"))

	router := gin.Default()

	AllowOrigin := "*"

	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", AllowOrigin)
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization,Stripe-Signature")
		c.Writer.Header().Set("Access-Control-Max-Age", "3600")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusOK)
			return
		}

		c.Next()
	})

	// Health endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"service":   "snout-api",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
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
		audioGroup.POST("/translate", audioHandler.Translate)
		audioGroup.POST("/tts", audioHandler.TextToSpeech)
		audioGroup.POST("/stt", audioHandler.SpeechToText)
		audioGroup.GET("/audiobook", audioHandler.GetAudiobook)
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

	workspacesHandler := workspaceshandler.New(dbClient)
	workspacesGroup := router.Group("/workspaces")
	{
		workspacesGroup.GET("", workspacesHandler.GetWorkspaces)
	}

	router.Run()
}
