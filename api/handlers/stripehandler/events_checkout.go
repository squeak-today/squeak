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

func HandleCheckoutSessionCompleted(checkout stripe.CheckoutSession, dbClient *supabase.Client) {
	stripe.Key = os.Getenv("STRIPE_KEY")
	userID := checkout.ClientReferenceID

	isAdmin, err := dbClient.CheckAdminStatus(userID)
	if err != nil {
		log.Printf("Error checking admin status: %v", err)
		return
	}
	if !isAdmin {
		return
	}

	payment_status := checkout.PaymentStatus
	if payment_status != "paid" {
		log.Printf("Invoice not paid: %v", payment_status)
		return
	}

	customerRef := checkout.Customer
	subscriptionRef := checkout.Subscription
	subParams := &stripe.SubscriptionParams{}
	expandedSubscription, _ := subscription.Get(subscriptionRef.ID, subParams)
	productRef := expandedSubscription.Items.Data[0].Plan.Product
	prodParams:= &stripe.ProductParams{}
	expandedProduct, _ := product.Get(productRef.ID, prodParams)
	plan := "CLASSROOM"
	if expandedProduct.Name == "Classroom" {
		plan = "CLASSROOM"
	}

	organizationID, err := dbClient.CheckTeacherOrganizationByUserID(userID)
	if err != nil {
		log.Printf("Error getting organization ID: %v", err)
		return
	}

	expirationTime := time.Unix(expandedSubscription.CurrentPeriodEnd, 0)
	log.Printf("Updating organization billing info with plan: %v, organizationID: %v, customerID: %v, subscriptionID: %v", plan, organizationID, customerRef.ID, subscriptionRef.ID)
	err = dbClient.UpdateOrganization(plan, organizationID, customerRef.ID, subscriptionRef.ID, expirationTime, false)
	if err != nil {
		log.Printf("Error updating organization billing: %v", err)
		return
	}
}
