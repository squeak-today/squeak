package supabase

import (
	"errors"
	"fmt"
	"time"

	"story-api/plans"
)

func getEndOfMonth() time.Time {
	now := time.Now()
	currentYear, currentMonth, _ := now.Date()
	lastOfMonth := time.Date(currentYear, currentMonth+1, 0, 23, 59, 59, 999999999, now.Location())
	return lastOfMonth
}

func (c *Client) InsertUsage(userID string, featureID string, amount int) error {
	if !plans.IsValidFeatureID(featureID) {
		return errors.New("invalid feature ID: " + featureID)
	}

	plan, expiration, _, _, _, err := c.GetBillingAccount(userID)
	if err != nil {
		return fmt.Errorf("failed to get billing account: %v", err)
	}

	var periodEnd time.Time
	if expiration.IsZero() {
		periodEnd = getEndOfMonth()
	} else {
		periodEnd = expiration
	}

	_, err = c.db.Exec(`
		INSERT INTO metered_usage (user_id, feature_id, plan, amount, period_end)
		VALUES ($1, $2, $3, $4, $5)
	`, userID, featureID, plan, amount, periodEnd.Format("2006-01-02"))

	return err
}

func (c *Client) GetUsage(userID string, featureID string, plan string) (int, error) {
	if !plans.IsValidFeatureID(featureID) {
		return 0, errors.New("invalid feature ID: " + featureID)
	}

	accountPlan, expiration, _, _, _, err := c.GetBillingAccount(userID)
	if err != nil {
		return 0, fmt.Errorf("failed to get billing account: %v", err)
	}

	if plan == "" {
		plan = accountPlan
	}

	var periodEnd time.Time
	if expiration.IsZero() {
		periodEnd = getEndOfMonth()
	} else {
		periodEnd = expiration
	}

	var totalAmount int
	err = c.db.QueryRow(`
		SELECT COALESCE(SUM(amount), 0)
		FROM metered_usage
		WHERE user_id = $1
		AND feature_id = $2
		AND plan = $3
		AND period_end = $4
	`, userID, featureID, plan, periodEnd.Format("2006-01-02")).Scan(&totalAmount)

	if err != nil {
		return 0, fmt.Errorf("failed to query metered usage: %v", err)
	}

	return totalAmount, nil
}
