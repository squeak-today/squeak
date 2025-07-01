package stripehandler

import (
	"log"
	"story-api/supabase"
	"time"

	"github.com/stripe/stripe-go/v81"
)

func HandleSubscriptionUpdated(subscription stripe.Subscription, dbClient *supabase.Client) {
	customerID := subscription.Customer.ID
	
	userID, err := dbClient.GetUserIDByCustomerID(customerID)
	if err != nil {
		log.Printf("Error getting user ID: %v", err)
		return
	}
	plan, expiration, _, customerID, subscriptionID, err := dbClient.GetBillingAccount(userID)
	if err != nil {
		log.Printf("Error getting billing account: %v", err)
		return
	}

	canceled := subscription.CancelAtPeriodEnd
	if canceled {
		log.Printf("Individual plan was canceled at end of period, updating billing account")
		err = dbClient.UpdateBillingAccount(userID, plan, customerID, subscriptionID, expiration, canceled)
		if err != nil {
			log.Printf("Error updating billing account: %v", err)
			return
		}
	}
	log.Printf("HandleSubscriptionUpdated: Neither Organization nor Individual mode!")
}

func HandleSubscriptionDeleted(subscription stripe.Subscription, dbClient *supabase.Client) {
	customerID := subscription.Customer.ID

	userID, err := dbClient.GetUserIDByCustomerID(customerID)
	if err != nil {
		log.Printf("Error getting user ID: %v", err)
		return
	}

	log.Printf("Updating billing account %v with customer %v, no subscription, nil expiration, and plan FREE", userID, customerID)
	err = dbClient.UpdateBillingAccount(userID, "FREE", customerID, "", time.Time{}, false)
	if err != nil {
		log.Printf("Error updating billing account: %v", err)
		return
	}
	log.Printf("HandleSubscriptionDeleted: Neither Organization nor Individual mode!")	
}