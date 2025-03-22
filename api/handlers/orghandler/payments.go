package org

import (
	"net/http"
	"os"

	"log"
	"story-api/models"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
)

// /organization/payments - returns a ping i guess
// /organization/payments/create-checkout-session

//	@Summary		Ping Payments
//	@Description	Ping Payments
//	@Tags			organization
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	models.PaymentsResponse
//	@Router			/organization/payments [get]
func (h *OrganizationHandler) GetOrganizationPayments(c *gin.Context) {
	c.JSON(http.StatusOK, models.PaymentsResponse{Success: true})
}

//	@Summary		Create a Stripe checkout session
//	@Description	Creates a checkout session and redirects to Stripe's payment page
//	@Tags			organization
//	@Accept			json
//	@Produce		json
//	@Success		303	{string}	string	"Redirect to Stripe Checkout"
//	@Router			/organization/payments/create-checkout-session [post]
func (h *OrganizationHandler) CreateCheckoutSession(c *gin.Context) {
	// ADD CHECK ADMIN STATUS HERE BEFORE DOING ANYTHING
	userID := h.GetUserIDFromToken(c)

	stripe.Key = os.Getenv("STRIPE_KEY")
	domain := "https://dashboard.squeak.today"
	priceID := "price_1R5Y2REtgulRmEeH0WdlFuZC"
	if os.Getenv("WORKSPACE") != "prod" {
		domain = "http://localhost:3001"
	}
	params := &stripe.CheckoutSessionParams{
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(priceID),
				Quantity: stripe.Int64(1),
			},
		},
		Mode:              stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		SuccessURL:        stripe.String(domain + "?success=true"),
		CancelURL:         stripe.String(domain + "?canceled=true"),
		ClientReferenceID: stripe.String(userID),
	}

	s, err := session.New(params)
	if err != nil {
		log.Printf("session.New: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create checkout session"})
		return
	}

	c.Redirect(http.StatusSeeOther, s.URL)
}
