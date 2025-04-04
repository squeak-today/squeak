package billing

import (
	"net/http"
	"os"

	"log"
	"time"
	"story-api/handlers"
	"story-api/models"
	"story-api/supabase"
	useStripe "story-api/stripe"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
)

type BillingHandler struct {
	*handlers.Handler
}

func New(dbClient *supabase.Client) *BillingHandler {
	return &BillingHandler{
		Handler: handlers.New(dbClient),
	}
}


//	@Summary		Check Billing Account
//	@Description	Check Billing Account
//	@Tags			billing
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	models.BillingAccountResponse
//	@Failure		401	{object}	models.ErrorResponse
//	@Router			/billing [get]
func (h *BillingHandler) GetBillingAccount(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	plan, expiration, canceled, _, _, err := h.DBClient.GetBillingAccount(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get billing account"})
		return
	}
	c.JSON(http.StatusOK, models.BillingAccountResponse{Plan: plan, Expiration: expiration, Canceled: canceled})
}

//	@Summary		Get Billing Account Usage
//	@Description	Get Billing Account Usage, assumes free plan
//	@Tags			billing
//	@Accept			json
//	@Produce		json
//	@Param			plan	query		string	false	"Plan"
//	@Success		200		{object}	models.BillingAccountUsageResponse
//	@Failure		401		{object}	models.ErrorResponse
//	@Router			/billing/usage [get]
func (h *BillingHandler) GetBillingAccountUsage(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	reqPlan := c.Query("plan")
	if reqPlan == "" {
		reqPlan = "FREE"
	}
	naturalTTSUsage, err := h.DBClient.GetUsage(userID, supabase.NATURAL_TTS_FEATURE, reqPlan)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get usage"})
	}
	naturalSTTUsage, err := h.DBClient.GetUsage(userID, supabase.NATURAL_STT_FEATURE, reqPlan)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get usage"})
	}
	c.JSON(http.StatusOK, models.BillingAccountUsageResponse{
		NaturalTTSUsage: naturalTTSUsage, 
		MaxNaturalTTSUsage: handlers.NATURAL_TTS_USAGE_LIMIT_FREE, 
		NaturalSTTUsage: naturalSTTUsage, 
		MaxNaturalSTTUsage: handlers.NATURAL_STT_USAGE_LIMIT_FREE,
	})
}

//	@Summary		Create a Stripe checkout session (individual)
//	@Description	Creates a checkout session and redirects to Stripe's payment page
//	@Tags			billing
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.CreateIndividualCheckoutSessionRequest	true	"Create checkout session request"
//	@Success		200		{object}	models.CreateIndividualCheckoutSessionResponse	"Redirect to Stripe Checkout"
//	@Failure		400		{object}	models.ErrorResponse
//	@Router			/billing/create-checkout-session [post]
func (h *BillingHandler) CreateCheckoutSession(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)

	plan, _, _, customerID, _, err := h.DBClient.GetBillingAccount(userID) // primarily to ensure user has a bbilling account on supa
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get billing account"})
		return
	}

	if plan != "FREE" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "User already has an active subscription"})
		return
	}

	stripe.Key = os.Getenv("STRIPE_KEY")
	domain := "https://squeak.today"
	priceID := "price_1R9SAUEtgulRmEeHY4qLLDG6"
	if os.Getenv("WORKSPACE") != "prod" {
		domain = "http://localhost:3000"
	}
	params := &stripe.CheckoutSessionParams{
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(priceID),
				Quantity: stripe.Int64(1),
			},
		},
		SubscriptionData: &stripe.CheckoutSessionSubscriptionDataParams{
			TrialPeriodDays: stripe.Int64(7),
		},
		Mode:              stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		SuccessURL:        stripe.String(domain + "/profile"),
		CancelURL:         stripe.String(domain + "/profile"),
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

	c.JSON(http.StatusOK, models.CreateIndividualCheckoutSessionResponse{RedirectUrl: s.URL})
}


//	@Summary		Cancel a Stripe individual subscription at the end of the period
//	@Description	Cancel a Stripe individual subscription at the end of the period
//	@Tags			billing
//	@Accept			json
//	@Produce		json
//	@Param			request	body		models.CancelIndividualSubscriptionRequest	true	"Cancel subscription request"
//	@Success		200		{object}	models.CancelIndividualSubscriptionResponse
//	@Failure		400		{object}	models.ErrorResponse
//	@Router			/billing/cancel-subscription-eop [post]
func (h *BillingHandler) CancelSubscriptionAtEndOfPeriod(c *gin.Context) {
	userID := h.GetUserIDFromToken(c)
	plan, expiration, _, _, subscriptionID, err := h.DBClient.GetBillingAccount(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to get billing account"})
		return
	}

	err = useStripe.CancelSubscriptionAtEndOfPeriod(subscriptionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to cancel subscription"})
		return
	}

	c.JSON(http.StatusOK, models.CancelIndividualSubscriptionResponse{
		Success: true,
		CurrentExpiration: expiration.Format(time.RFC1123),
		CanceledPlan: plan,
	})
}