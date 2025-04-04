package stripehandler

import (
	"log"
	"story-api/supabase"
	"time"
	"os"

	stripe "github.com/stripe/stripe-go/v81"
	subscription "github.com/stripe/stripe-go/v81/subscription"
	product "github.com/stripe/stripe-go/v81/product"
)

func HandleInvoicePaymentSucceeded(invoice stripe.Invoice, dbClient *supabase.Client) {
	stripe.Key = os.Getenv("STRIPE_KEY")
	customerRef := invoice.Customer
	subscriptionRef := invoice.Subscription
	subParams := &stripe.SubscriptionParams{}
	expandedSubscription, _ := subscription.Get(subscriptionRef.ID, subParams)
	productRef := expandedSubscription.Items.Data[0].Plan.Product
	prodParams:= &stripe.ProductParams{}
	expandedProduct, _ := product.Get(productRef.ID, prodParams)

	mode := HandleModeOrganization
	plan := "CLASSROOM"
	if expandedProduct.Name == "Premium" {
		plan = "PREMIUM"
		mode = HandleModeIndividual
	}

	if mode == HandleModeOrganization {

		organizationID, err := dbClient.GetOrganizationByCustomerID(customerRef.ID)
		if err != nil {
			log.Printf("Error getting organization ID: %v", err)
			return
		}

		expirationTime := time.Unix(expandedSubscription.CurrentPeriodEnd, 0)

		err = dbClient.UpdateOrganization(plan, organizationID, customerRef.ID, subscriptionRef.ID, expirationTime, false)
		if err != nil {
			log.Printf("Error updating organization: %v", err)
			return
		}
	} else if mode == HandleModeIndividual {
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
	}
	log.Printf("HandleInvoicePaymentSucceeded: Neither Organization nor Individual mode!")
}

func HandleInvoicePaymentFailed(invoice stripe.Invoice, dbClient *supabase.Client) {
	stripe.Key = os.Getenv("STRIPE_KEY")
	customerRef := invoice.Customer
	subscriptionRef := invoice.Subscription
	subParams := &stripe.SubscriptionParams{}
	expandedSubscription, _ := subscription.Get(subscriptionRef.ID, subParams)
	productRef := expandedSubscription.Items.Data[0].Plan.Product
	prodParams:= &stripe.ProductParams{}
	expandedProduct, _ := product.Get(productRef.ID, prodParams)

	mode := HandleModeOrganization
	if expandedProduct.Name == "Premium" {
		mode = HandleModeIndividual
	}
	
	if mode == HandleModeOrganization {
		organizationID, err := dbClient.GetOrganizationByCustomerID(customerRef.ID)
		if err != nil {
			log.Printf("Error getting organization ID: %v", err)
			return
		}

		log.Printf("Updating organization %v with customer %v, no subscription, same expiration, and plan FREE", organizationID, customerRef.ID)
		err = dbClient.UpdateOrganization("FREE", organizationID, customerRef.ID, "", time.Time{}, true)
		if err != nil {
			log.Printf("Error updating organization: %v", err)
			return
		}
	} else if mode == HandleModeIndividual {
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
	}
	log.Printf("HandleInvoicePaymentFailed: Neither Organization nor Individual mode!")
}
