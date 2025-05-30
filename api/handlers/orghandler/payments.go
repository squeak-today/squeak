package org

import (
	"net/http"
	"os"

	"log"
	"time"
	"story-api/models"
	useStripe "story-api/stripe"

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
//	@Param			request	body		models.CreateCheckoutSessionRequest		true	"Create checkout session request"
//	@Success		200		{object}	models.CreateCheckoutSessionResponse	"Redirect to Stripe Checkout"
//	@Failure		400		{object}	models.ErrorResponse
//	@Router			/organization/payments/create-checkout-session [post]
func (h *OrganizationHandler) CreateCheckoutSession(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	isAdmin := h.CheckIsCorrectRole(c, userID, "admin")
	if !isAdmin {
		c.JSON(http.StatusForbidden, models.ErrorResponse{Error: "Only admins can create checkout sessions"})
		return
	}

	organizationID, err := h.DBClient.CheckTeacherOrganizationByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get organization ID"})
		return
	}
	log.Printf("organizationID: %v", organizationID)

	// check if user has active subscription
	plan, customerID, _, _, _, err := h.DBClient.GetOrganizationInfo(organizationID)
	if err != nil {
		log.Printf("Failed to get organization info: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get organization info"})
		return
	}

	if plan != "FREE" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "User already has an active subscription"})
		return
	}

	stripe.Key = os.Getenv("STRIPE_KEY")
	domain := "https://dashboard.squeak.today"
	priceID := "price_1RA3FGEtgulRmEeHKJyh6ziL"
	if os.Getenv("WORKSPACE") != "prod" {
		domain = "http://localhost:5173"
	}
	params := &stripe.CheckoutSessionParams{
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(priceID),
				Quantity: stripe.Int64(1),
			},
		},
		SubscriptionData: &stripe.CheckoutSessionSubscriptionDataParams{
			TrialPeriodDays: stripe.Int64(14),
		},
		Mode:              stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		SuccessURL:        stripe.String(domain + "/settings"),
		CancelURL:         stripe.String(domain + "/settings"),
		ClientReferenceID: stripe.String(userID),
	}

	if customerID != "" {
		params.Customer = stripe.String(customerID)
	}

	s, err := session.New(params)
	if err != nil {
		log.Printf("session.New: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create checkout session"})
		return
	}

	c.JSON(http.StatusOK, models.CreateCheckoutSessionResponse{RedirectUrl: s.URL})
}


//	@Summary		Cancel a Stripe subscription at the end of the period
//	@Description	Cancel a Stripe subscription at the end of the period
//	@Tags			organization
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.CancelSubscriptionRequest	true	"Cancel subscription request"
//	@Success		200		{object}	models.CancelSubscriptionResponse
//	@Failure		400		{object}	models.ErrorResponse
//	@Router			/organization/payments/cancel-subscription-eop [post]
func (h *OrganizationHandler) CancelSubscriptionAtEndOfPeriod(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	isAdmin := h.CheckIsCorrectRole(c, userID, "admin")
	if !isAdmin {
		c.JSON(http.StatusForbidden, models.ErrorResponse{Error: "Only admins can cancel subscriptions"})
		return
	}

	organizationID, err := h.DBClient.CheckTeacherOrganizationByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get organization ID"})
		return
	}

	plan, _, subscriptionID, expiration, _, err := h.DBClient.GetOrganizationInfo(organizationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get organization info"})
		return
	}

	err = useStripe.CancelSubscriptionAtEndOfPeriod(subscriptionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to cancel subscription"})
		return
	}

	c.JSON(http.StatusOK, models.CancelSubscriptionResponse{
		Success: true,
		CurrentExpiration: expiration.Format(time.RFC1123),
		CanceledPlan: plan,
	})
}