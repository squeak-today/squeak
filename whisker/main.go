package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"snout/supabase"

	"whisker/api"
	"whisker/consumer"
	"whisker/processor"
	"whisker/worker"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found - using environment variables")
	}

	workspace := os.Getenv("WORKSPACE")
	if workspace == "prod" {
		gin.SetMode(gin.ReleaseMode)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	supabaseClient, err := supabase.NewClient()
	if err != nil {
		log.Fatalf("Failed to initialize Supabase client: %v", err)
	}
	defer supabaseClient.Close()
	log.Println("Supabase client initialized successfully")

	maxWorkers := getEnvInt("MAX_WORKERS", 5)

	contentProcessor := processor.NewContentProcessor(supabaseClient)
	pool := worker.NewPool(ctx, maxWorkers, contentProcessor, supabaseClient)

	var jobConsumer *consumer.Consumer
	if workspace == "prod" || workspace == "dev_sqs" {
		jobConsumer, err = consumer.NewConsumer(ctx, pool)
		if err != nil {
			log.Fatalf("Failed to initialize consumer: %v", err)
		}

		go jobConsumer.Start(ctx)
		log.Println("Started SQS consumer")
	} else {
		log.Println("Running in development mode - processing jobs directly")
	}

	apiHandler := api.NewAPI(pool)
	router := gin.Default()
	apiHandler.SetupRoutes(router)

	srv := &http.Server{
		Addr:         ":" + getEnvString("PORT", "8081"),
		Handler:      router,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("Server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	// Cancels main context, which cancels accepting new jobs
	cancel()

	// Stop the consumer if it exists
	if jobConsumer != nil {
		if err := jobConsumer.Stop(); err != nil {
			log.Printf("Error stopping consumer: %v", err)
		}
	}

	pool.Stop()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}

func getEnvString(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	if val := os.Getenv(key); val != "" {
		if intVal, err := strconv.Atoi(val); err == nil {
			return intVal
		}
	}
	return defaultVal
}
