package stripehandler

import (
	"log"
	"story-api/supabase"
	"time"

	"github.com/stripe/stripe-go/v81"
)

func HandleSubscriptionDeleted(subscription stripe.Subscription, dbClient *supabase.Client) {
	customerID := subscription.Customer.ID
	organizationID, err := dbClient.GetOrganizationByCustomerID(customerID)
	if err != nil {
		log.Printf("Error getting organization ID: %v", err)
		return
	}

	log.Printf("Updating organization %v with customer %v, no subscription, same expiration, and plan FREE", organizationID, customerID)
	err = dbClient.UpdateOrganization("FREE", organizationID, customerID, "", time.Time{})
	if err != nil {
		log.Printf("Error updating organization: %v", err)
		return
	}
}