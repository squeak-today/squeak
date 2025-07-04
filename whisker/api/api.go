package api

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CreateRequest struct{}

func SetupRoutes(r *gin.Engine) {
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	r.POST("/create", func(c *gin.Context) {
		var req CreateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request payload: " + err.Error(),
			})
			return
		}

		log.Printf("Received creation request")

		c.JSON(http.StatusAccepted, gin.H{})
	})
}
