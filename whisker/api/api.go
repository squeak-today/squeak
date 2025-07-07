package api

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	types "snout/whisker_types"
	"whisker/worker"
)

type API struct {
	pool *worker.Pool
}

func NewAPI(pool *worker.Pool) *API {
	return &API{
		pool: pool,
	}
}

func (a *API) SetupRoutes(r *gin.Engine) {
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":      "ok",
			"active_jobs": a.pool.ActiveJobs(),
		})
	})

	r.POST("/create", func(c *gin.Context) {
		var jobRequest types.ContentJobRequest
		if err := c.ShouldBindJSON(&jobRequest); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid request payload: " + err.Error(),
			})
			return
		}

		if err := a.pool.ProcessJob(&jobRequest, nil); err != nil {
			log.Printf("Failed to process job: %v", err)
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"error": "Failed to process job: " + err.Error(),
			})
			return
		}

		c.JSON(http.StatusAccepted, gin.H{
			"message": "Job started successfully",
		})
	})
}
