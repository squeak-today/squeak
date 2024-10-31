package main

import (
	"context"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/awslabs/aws-lambda-go-api-proxy/gin"
	"github.com/gin-gonic/gin"
)

// STORY_BUCKET_NAME="story-generation-bucket-dev" go run .
// GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap .
// zip front-function.zip bootstrap

var ginLambda *ginadapter.GinLambda

func init() {
	log.Println("Gin cold start")
	router := gin.Default()
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	ginLambda = ginadapter.New(router)
}

func Handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// if no name is provided in body, throw err ?
	return ginLambda.ProxyWithContext(ctx, req)
}

func main() {
	// story, err := pullStory("French", "B2")
	lambda.Start(Handler)
}
