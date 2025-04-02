package stripehandler

import (
	"log"
	"story-api/supabase"
	"time"

	"github.com/stripe/stripe-go/v81"
)

func HandleSubscriptionUpdated(subscription stripe.Subscription, dbClient *supabase.Client) {
	customerID := subscription.Customer.ID
	organizationID, err := dbClient.GetOrganizationByCustomerID(customerID)
	if err != nil {
		log.Printf("Error getting organization ID: %v", err)
		return
	}

	plan, customerID, subscriptionID, expiration, _, err := dbClient.GetOrganizationInfo(organizationID)
	if err != nil {
		log.Printf("Error getting organization info: %v", err)
		return
	}

	canceled := subscription.CancelAtPeriodEnd
	if canceled {
		log.Printf("Organization plan was canceled at end of period, updating organization")
		err = dbClient.UpdateOrganization(plan, organizationID, customerID, subscriptionID, expiration, canceled)
		if err != nil {
			log.Printf("Error updating organization: %v", err)
			return
		}
	}
}

func HandleSubscriptionDeleted(subscription stripe.Subscription, dbClient *supabase.Client) {
	customerID := subscription.Customer.ID
	organizationID, err := dbClient.GetOrganizationByCustomerID(customerID)
	if err != nil {
		log.Printf("Error getting organization ID: %v", err)
		return
	}

	log.Printf("Updating organization %v with customer %v, no subscription, same expiration, and plan FREE", organizationID, customerID)
	err = dbClient.UpdateOrganization("FREE", organizationID, customerID, "", time.Time{}, false)
	if err != nil {
		log.Printf("Error updating organization: %v", err)
		return
	}
}