package main

import (
	"context"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/awslabs/aws-lambda-go-api-proxy/gin"
	"github.com/gin-gonic/gin"
	"net/http"
)

// STORY_BUCKET_NAME="story-generation-bucket-dev" go run .
// GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap .
// zip front-function.zip bootstrap

// AFTER TERRAFORM RUN TEST WITH
// curl "https://<api-id>.execute-api.us-east-2.amazonaws.com/dev/story?language=French&cefr=B2"

var ginLambda *ginadapter.GinLambda

func init() {
	log.Println("Gin cold start")
	router := gin.Default()
	router.GET("/story", func(c *gin.Context) {
		language := c.Query("language")
		cefr := c.Query("cefr")

		if language == "" || cefr == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "language and cefr parameter is required!",
			})
			return
		}

		// theres no check for valid language or cefr yet

		story, err := pullStory(language, cefr)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "story retrieval failed!",
			})
		}

		c.JSON(http.StatusOK, gin.H{
			"content": story,
		})
	})

	ginLambda = ginadapter.New(router)
}

func Handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// if no name is provided in body, throw err ?
	return ginLambda.ProxyWithContext(ctx, req)
}

func main() {
	lambda.Start(Handler)
}
