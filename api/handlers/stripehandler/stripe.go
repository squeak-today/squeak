package stripehandler

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"story-api/handlers"
	"story-api/models"
	"story-api/supabase"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/webhook"
)

type StripeHandler struct {
	*handlers.Handler
}

func New(dbClient *supabase.Client) *StripeHandler {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	return &StripeHandler{
		Handler: handlers.New(dbClient),
	}
}

//	@Summary		Process Stripe webhook
//	@Description	Validates and processes incoming webhook events from Stripe
//	@Tags			stripe
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	models.WebhookResponse
//	@Failure		400	{object}	models.ErrorResponse
//	@Router			/webhook [post]
func (h *StripeHandler) HandleWebhook(c *gin.Context) {
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("Error reading request body: %v\n", err)
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Error reading request body"})
		return
	}

	signatureHeader := c.GetHeader("Stripe-Signature")
	if signatureHeader == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Missing Stripe-Signature header"})
		return
	}

	endpointSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	if endpointSecret == "" {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Webhook secret not configured"})
		return
	}

	event, err := webhook.ConstructEvent(payload, signatureHeader, endpointSecret)
	if err != nil {
		log.Printf("Webhook signature verification failed: %v\n", err)
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Webhook signature verification failed"})
		return
	}

	prettyJSON, err := json.MarshalIndent(event, "", "  ")
	if err != nil {
		log.Printf("Error formatting JSON: %v\n", err)
	} else {
		log.Printf("Received Stripe webhook event: %s\nPayload: %s\n", event.Type, string(prettyJSON))
	}

	c.JSON(http.StatusOK, models.WebhookResponse{
		Received: true,
		Type:     string(event.Type),
	})
}
