package stripehandler

import (
	"log"
	"os"
	"squeak-api/supabase"
	"time"

	stripe "github.com/stripe/stripe-go/v81"
	subscription "github.com/stripe/stripe-go/v81/subscription"
)

func HandleInvoicePaymentSucceeded(invoice stripe.Invoice, dbClient *supabase.Client) {
	stripe.Key = os.Getenv("STRIPE_KEY")
	customerRef := invoice.Customer
	subscriptionRef := invoice.Subscription
	subParams := &stripe.SubscriptionParams{}
	expandedSubscription, _ := subscription.Get(subscriptionRef.ID, subParams)

	plan := "PREMIUM"

	userID, err := dbClient.GetUserIDByCustomerID(customerRef.ID)
	if err != nil {
		log.Printf("Error getting user ID: %v", err)
		return
	}

	expirationTime := time.Unix(expandedSubscription.CurrentPeriodEnd, 0)
	err = dbClient.UpdateBillingAccount(userID, plan, customerRef.ID, subscriptionRef.ID, expirationTime, false)
	if err != nil {
		log.Printf("Error updating billing account: %v", err)
		return
	}
	log.Printf("HandleInvoicePaymentSucceeded: Neither Organization nor Individual mode!")
}

func HandleInvoicePaymentFailed(invoice stripe.Invoice, dbClient *supabase.Client) {
	stripe.Key = os.Getenv("STRIPE_KEY")
	customerRef := invoice.Customer

	userID, err := dbClient.GetUserIDByCustomerID(customerRef.ID)
	if err != nil {
		log.Printf("Error getting user ID: %v", err)
		return
	}

	log.Printf("Updating billing account %v with customer %v, no subscription, same expiration, and plan FREE", userID, customerRef.ID)
	err = dbClient.UpdateBillingAccount(userID, "FREE", customerRef.ID, "", time.Time{}, true)
	if err != nil {
		log.Printf("Error updating billing account: %v", err)
		return
	}
	log.Printf("HandleInvoicePaymentFailed: Neither Organization nor Individual mode!")
}
