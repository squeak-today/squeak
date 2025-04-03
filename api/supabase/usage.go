package supabase

import (
	"fmt"
	"time"
)


func (c *Client) GetUsage(userID string, featureID string, plan string, periodEnd time.Time) (int, error) {
	var totalAmount int
	err := c.db.QueryRow(`
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