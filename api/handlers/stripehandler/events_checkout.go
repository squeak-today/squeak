package stripehandler

import (
	"log"
	"os"
	"squeak-api/supabase"
	"time"

	stripe "github.com/stripe/stripe-go/v81"
	subscription "github.com/stripe/stripe-go/v81/subscription"
)

// We need to handle INDIVIDUAL vs ORGANIZATION by checking "Premium" vs "Classroom"
func HandleCheckoutSessionCompleted(checkout stripe.CheckoutSession, dbClient *supabase.Client) {
	stripe.Key = os.Getenv("STRIPE_KEY")
	userID := checkout.ClientReferenceID

	customerRef := checkout.Customer
	subscriptionRef := checkout.Subscription
	subParams := &stripe.SubscriptionParams{}
	expandedSubscription, _ := subscription.Get(subscriptionRef.ID, subParams)

	plan := "PREMIUM"

	payment_status := checkout.PaymentStatus
	if payment_status != "paid" {
		log.Printf("Invoice not paid: %v", payment_status)
		return
	}

	expirationTime := time.Unix(expandedSubscription.CurrentPeriodEnd, 0)
	log.Printf("Updating individual billing info with plan: %v, userID: %v, customerID: %v, subscriptionID: %v", plan, userID, customerRef.ID, subscriptionRef.ID)
	err := dbClient.UpdateBillingAccount(userID, plan, customerRef.ID, subscriptionRef.ID, expirationTime, false)
	if err != nil {
		log.Printf("Error updating individual billing: %v", err)
		return
	}
	log.Printf("HandleCheckoutSessionCompleted: Neither Organization nor Individual mode!")
}
