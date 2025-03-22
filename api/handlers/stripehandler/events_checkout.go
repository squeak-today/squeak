package stripehandler

import (
	"log"
	"story-api/supabase"
	"time"

	"github.com/stripe/stripe-go/v81"
)

func HandleCheckoutSessionCompleted(checkout stripe.CheckoutSession, dbClient *supabase.Client) {
	userID := checkout.ClientReferenceID

	isAdmin, err := dbClient.CheckAdminStatus(userID)
	if err != nil {
		log.Printf("Error checking admin status: %v", err)
		return
	}
	if !isAdmin {
		return
	}

	customer := checkout.Customer
	subscription := checkout.Subscription
	invoice := checkout.Invoice
	if invoice.Status != "paid" {
		log.Printf("Invoice not paid: %v", invoice.Status)
		return
	}

	product := subscription.Items.Data[0].Plan.Product
	plan := "STANDARD"
	if product.Name == "Classroom" {
		plan = "STANDARD"
	}

	organizationID, err := dbClient.CheckTeacherOrganizationByUserID(userID)
	if err != nil {
		log.Printf("Error getting organization ID: %v", err)
		return
	}

	expirationTime := time.Unix(subscription.CurrentPeriodEnd, 0)

	err = dbClient.UpdateOrganization(plan, organizationID, customer.ID, subscription.ID, expirationTime)
	if err != nil {
		log.Printf("Error updating organization billing: %v", err)
		return
	}
}
