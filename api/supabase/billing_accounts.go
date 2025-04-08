package supabase

import (
	"fmt"
	"time"
)

func (c *Client) GetUserIDByCustomerID(customerID string) (string, error) {
	var userID string
	err := c.db.QueryRow(`
		SELECT user_id FROM billing_accounts WHERE customer_id = $1`,
		customerID).Scan(&userID)
	if err != nil {
		return "", err
	}
	return userID, nil
}

func (c *Client) GetBillingAccount(userID string) (string, time.Time, bool, string, string, error) {
	var plan string
	var expiration *time.Time
	var canceled *bool
	var customerID *string
	var subscriptionID *string

	err := c.db.QueryRow(`
		SELECT plan, expiration, canceled, customer_id, subscription_id FROM billing_accounts WHERE user_id = $1`,
		userID).Scan(&plan, &expiration, &canceled, &customerID, &subscriptionID)

	if err != nil && err.Error() == "sql: no rows in result set" {
		_, err = c.db.Exec(`
			INSERT INTO billing_accounts (user_id, plan, canceled)
			VALUES ($1, 'FREE', false)`, userID)
		if err != nil {
			return "", time.Time{}, false, "", "", err
		}

		return "FREE", time.Time{}, false, "", "", nil
	} else if err != nil {
		return "", time.Time{}, false, "", "", err
	}

	expirationTime := time.Time{}
	if expiration != nil {
		expirationTime = *expiration
	}

	canceledBool := false
	if canceled != nil {
		canceledBool = *canceled
	}

	customerIDStr := ""
	if customerID != nil {
		customerIDStr = *customerID
	}

	subscriptionIDStr := ""
	if subscriptionID != nil {
		subscriptionIDStr = *subscriptionID
	}

	return plan, expirationTime, canceledBool, customerIDStr, subscriptionIDStr, nil
}

func (c *Client) UpdateBillingAccount(userID, plan, customerID, subscriptionID string, expiration time.Time, canceled bool) error {
	var expirationValue interface{}
	if !expiration.IsZero() {
		expirationValue = expiration.Format("2006-01-02")
	} else {
		expirationValue = nil
	}

	query := `
		UPDATE billing_accounts 
		SET 
			plan = $1,
			customer_id = NULLIF($2, ''),
			subscription_id = NULLIF($3, ''),
			expiration = $4,
			canceled = $5,
			updated_at = CURRENT_TIMESTAMP
		WHERE user_id = $6`

	result, err := c.db.Exec(query, plan, customerID, subscriptionID, expirationValue, canceled, userID)
	if err != nil {
		return fmt.Errorf("failed to update billing account: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error checking rows affected: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("no billing account found with ID: %s", userID)
	}

	return nil
}
