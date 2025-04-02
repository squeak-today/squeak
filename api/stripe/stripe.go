package stripe

import (
	"log"
	"os"

	stripe "github.com/stripe/stripe-go/v81"
	subscription "github.com/stripe/stripe-go/v81/subscription"
)

func CancelSubscriptionAtEndOfPeriod(subscriptionID string) error {
	stripe.Key = os.Getenv("STRIPE_KEY")
	params := &stripe.SubscriptionParams{};
	params.CancelAtPeriodEnd = stripe.Bool(true)
	result, err := subscription.Update(subscriptionID, params);
	if err != nil {
		log.Printf("Error canceling subscription: %v", err)
		return err
	}
	log.Printf("Subscription canceled: %v", result)
	return nil
}
