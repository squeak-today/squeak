package stripehandler

import (
	"log"
	"story-api/supabase"
	"time"

	"github.com/stripe/stripe-go/v81"
)

func HandleInvoicePaymentSucceeded(invoice stripe.Invoice, dbClient *supabase.Client) {
	customer := invoice.Customer
	subscription := invoice.Subscription

	product := subscription.Items.Data[0].Plan.Product
	plan := "STANDARD"
	if product.Name == "Classroom" {
		plan = "STANDARD"
	}

	organizationID, err := dbClient.GetOrganizationByCustomerID(customer.ID)
	if err != nil {
		log.Printf("Error getting organization ID: %v", err)
		return
	}

	expirationTime := time.Unix(subscription.CurrentPeriodEnd, 0)

	err = dbClient.UpdateOrganization(plan, organizationID, customer.ID, subscription.ID, expirationTime)
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

	err = dbClient.UpdateOrganization("FREE", organizationID, customer.ID, "", time.Time{})
	if err != nil {
		log.Printf("Error updating organization: %v", err)
		return
	}
}