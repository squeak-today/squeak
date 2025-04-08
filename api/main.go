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
	"strings"

	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	ginadapter "github.com/awslabs/aws-lambda-go-api-proxy/gin"
	"github.com/gin-gonic/gin"

	"github.com/golang-jwt/jwt/v5"
	_ "github.com/lib/pq"

	"story-api/audio"
	"story-api/supabase"

	"story-api/handlers/audiohandler"
	"story-api/handlers/newshandler"
	"story-api/handlers/profilehandler"
	"story-api/handlers/progresshandler"
	"story-api/handlers/qnahandler"
	"story-api/handlers/storyhandler"
	"story-api/handlers/stripehandler"
	"story-api/handlers/student"
	"story-api/handlers/teacher"
	"story-api/handlers/orghandler"
	"story-api/handlers/billinghandler"
	"story-api/handlers/deckhandler"
	"story-api/handlers/stathandler"
	"story-api/handlers/flashcardhandler"
)

type Profile = supabase.Profile

var ginLambda *ginadapter.GinLambda
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

func init() {
	log.Println("Gin cold start")

	var err error
	dbClient, err = supabase.NewClient()
	audioClient := audio.NewClient(os.Getenv("GOOGLE_API_KEY"), os.Getenv("ELEVENLABS_API_KEY"))
	if err != nil {
		log.Fatalf("Failed to initialize database connection: %v", err)
	}

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

	orgHandler := org.New(dbClient)
	orgGroup := router.Group("/organization")
	{
		orgGroup.GET("", orgHandler.CheckOrganization)
		orgGroup.POST("/create", orgHandler.CreateOrganization)
		orgGroup.POST("/join", orgHandler.JoinOrganization)

		paymentsGroup := orgGroup.Group("/payments")
		{
			paymentsGroup.GET("", orgHandler.GetOrganizationPayments)
			paymentsGroup.POST("/create-checkout-session", orgHandler.CreateCheckoutSession)
			paymentsGroup.POST("/cancel-subscription-eop", orgHandler.CancelSubscriptionAtEndOfPeriod)
		}
	}

	teacherHandler := teacher.New(dbClient)
	teacherGroup := router.Group("/teacher")
	{
		teacherGroup.GET("", teacherHandler.CheckTeacherStatus)

		classroomGroup := teacherGroup.Group("/classroom")
		{
			classroomGroup.GET("", teacherHandler.GetClassroomList)
			classroomGroup.POST("/update", teacherHandler.UpdateClassroom)
			classroomGroup.GET("/content", teacherHandler.QueryClassroomContent)
			classroomGroup.POST("/create", teacherHandler.CreateClassroom)
			classroomGroup.POST("/delete", teacherHandler.DeleteClassroom)
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
		audioGroup.POST("/stt", audioHandler.SpeechToText)
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

	ginLambda = ginadapter.New(router)

	// In main.go, add these handlers with the imports
	deckHandler := deckhandler.New(dbClient)
	flashcardHandler := flashcardhandler.New(dbClient)
	statsHandler := statshandler.New(dbClient)

	// Add these route groups after your existing ones
	deckGroup := router.Group("/deck")
	{
		deckGroup.GET("", deckHandler.GetDecks)
		deckGroup.GET("/:id", deckHandler.GetDeck)
		deckGroup.POST("/create", deckHandler.CreateDeck)
		deckGroup.POST("/:id/delete", deckHandler.DeleteDeck)
	}

	flashcardGroup := router.Group("/flashcard")
	{
		flashcardGroup.POST("/create", flashcardHandler.CreateFlashcard)
		flashcardGroup.POST("/:id/update", flashcardHandler.UpdateFlashcard)
		flashcardGroup.POST("/:id/delete", flashcardHandler.DeleteFlashcard)
	}

	statsGroup := router.Group("/stats")
	{
		statsGroup.GET("", statsHandler.GetUserStats)
		statsGroup.POST("/record", statsHandler.RecordStudySession)
	}
}

func Handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return ginLambda.ProxyWithContext(ctx, req)
}

func main() {
	lambda.Start(Handler)
}
