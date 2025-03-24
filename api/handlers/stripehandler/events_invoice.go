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
	plan := "STANDARD"
	if expandedProduct.Name == "Classroom" {
		plan = "STANDARD"
	}

	organizationID, err := dbClient.GetOrganizationByCustomerID(customerRef.ID)
	if err != nil {
		log.Printf("Error getting organization ID: %v", err)
		return
	}

	expirationTime := time.Unix(expandedSubscription.CurrentPeriodEnd, 0)

	err = dbClient.UpdateOrganization(plan, organizationID, customerRef.ID, subscriptionRef.ID, expirationTime)
	if err != nil {
		log.Printf("Error updating organization: %v", err)
		return
	}
}

func HandleInvoicePaymentFailed(invoice stripe.Invoice, dbClient *supabase.Client) {
	customer := invoice.Customer
	organizationID, err := dbClient.GetOrganizationByCustomerID(customer.ID)
	if err != nil {
		log.Printf("Error getting organization ID: %v", err)
		return
	}

	log.Printf("Updating organization %v with customer %v, no subscription, same expiration, and plan FREE", organizationID, customer.ID)
	err = dbClient.UpdateOrganization("FREE", organizationID, customer.ID, "", time.Time{})
	if err != nil {
		log.Printf("Error updating organization: %v", err)
		return
	}
}
