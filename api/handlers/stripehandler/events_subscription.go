package stripehandler

import (
	"log"
	"story-api/supabase"
	"time"

	"github.com/stripe/stripe-go/v81"
	product "github.com/stripe/stripe-go/v81/product"
)

func HandleSubscriptionUpdated(subscription stripe.Subscription, dbClient *supabase.Client) {
	productRef := subscription.Items.Data[0].Plan.Product
	prodParams:= &stripe.ProductParams{}
	expandedProduct, _ := product.Get(productRef.ID, prodParams)
	
	mode := HandleModeOrganization
	if expandedProduct.Name == "Premium" {
		mode = HandleModeIndividual
	}
	
	
	customerID := subscription.Customer.ID
	
	if mode == HandleModeOrganization {
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
	} else if mode == HandleModeIndividual {
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
	}
	log.Printf("HandleSubscriptionUpdated: Neither Organization nor Individual mode!")
}

func HandleSubscriptionDeleted(subscription stripe.Subscription, dbClient *supabase.Client) {
	productRef := subscription.Items.Data[0].Plan.Product
	prodParams:= &stripe.ProductParams{}
	expandedProduct, _ := product.Get(productRef.ID, prodParams)
	
	mode := HandleModeOrganization
	if expandedProduct.Name == "Premium" {
		mode = HandleModeIndividual
	}
	
	customerID := subscription.Customer.ID

	if mode == HandleModeOrganization {
		organizationID, err := dbClient.GetOrganizationByCustomerID(customerID)
		if err != nil {
			log.Printf("Error getting organization ID: %v", err)
			return
		}

		log.Printf("Updating organization %v with customer %v, no subscription, nil expiration, and plan FREE", organizationID, customerID)
		err = dbClient.UpdateOrganization("FREE", organizationID, customerID, "", time.Time{}, false)
		if err != nil {
			log.Printf("Error updating organization: %v", err)
			return
		}
	} else if mode == HandleModeIndividual {
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
	}
	log.Printf("HandleSubscriptionDeleted: Neither Organization nor Individual mode!")	
}