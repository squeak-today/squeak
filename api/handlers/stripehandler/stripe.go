package stripehandler

import (
	"io"
	"log"
	"net/http"
	"os"
	"encoding/json"
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

	switch event.Type {
	case "checkout.session.completed":
		var checkout stripe.CheckoutSession
		err := json.Unmarshal(event.Data.Raw, &checkout)
        if err != nil {
            log.Printf("Error parsing webhook JSON: %v\n", err)
            c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Error parsing webhook JSON"})
            return
        }
		HandleCheckoutSessionCompleted(checkout, h.DBClient)
	case "invoice.payment_succeeded":
		var invoice stripe.Invoice
		err := json.Unmarshal(event.Data.Raw, &invoice)
		if err != nil {
			log.Printf("Error parsing webhook JSON: %v\n", err)
			c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Error parsing webhook JSON"})
			return
		}
		HandleInvoicePaymentSucceeded(invoice, h.DBClient)
	case "invoice.payment_failed":
		var invoice stripe.Invoice
		err := json.Unmarshal(event.Data.Raw, &invoice)
		if err != nil {
			log.Printf("Error parsing webhook JSON: %v\n", err)
			c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Error parsing webhook JSON"})
			return
		}
		HandleInvoicePaymentFailed(invoice, h.DBClient)
	case "customer.subscription_updated":
		// this event also catches when they cancel their subscription
	case "customer.subscription_deleted":
		var subscription stripe.Subscription
		err := json.Unmarshal(event.Data.Raw, &subscription)
		if err != nil {
			log.Printf("Error parsing webhook JSON: %v\n", err)
			c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Error parsing webhook JSON"})
			return
		}
		HandleSubscriptionDeleted(subscription, h.DBClient)
	}

	c.JSON(http.StatusOK, models.WebhookResponse{
		Received: true,
		Type:     string(event.Type),
	})
}
