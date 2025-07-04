package main

import (
	"context"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"whisker/api"
	"whisker/consumer"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found - using environment variables")
	}

	workspace := os.Getenv("WORKSPACE")
	if workspace == "prod" {
		gin.SetMode(gin.ReleaseMode)
	}

	ctx := context.Background()

	if workspace == "prod" {
		jobConsumer, err := consumer.NewConsumer(ctx)
		if err != nil {
			log.Fatalf("Failed to initialize consumer: %v", err)
		}

		go jobConsumer.Start(ctx)
		log.Println("Started SQS consumer")
	} else {
		log.Println("Running in development mode - SQS consumer disabled")
	}

	router := gin.Default()
	api.SetupRoutes(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	router.Run(":" + port)
}
