package supabase

import (
	"fmt"
	"time"
)

func (c *Client) GetTeacherUUID(userID string) (string, error) {
	var uuid string
	err := c.db.QueryRow(`
		SELECT id 
		FROM teachers
		WHERE user_id = $1`, userID).Scan(&uuid)

	if err != nil {
		return "", fmt.Errorf("teacher doesn't exist with that user id")
	}

	return uuid, nil
}

func (c *Client) CheckTeacherOrganization(teacherID string) (string, error) {
	var uuid string
	err := c.db.QueryRow(`
		SELECT organization_id 
		FROM teachers
		WHERE id = $1`, teacherID).Scan(&uuid)

	if err != nil {
		return "", err
	}

	return uuid, nil
}

func (c *Client) CheckTeacherOrganizationByUserID(userID string) (string, error) {
	var organizationID string
	err := c.db.QueryRow(`
		SELECT organization_id
		FROM teachers
		WHERE user_id = $1`, userID).Scan(&organizationID)

	if err != nil {
		return "", err
	}

	return organizationID, nil
}

func (c *Client) GetOrganizationPlan(organizationID string) (string, error) {
	var plan string
	err := c.db.QueryRow(`
		SELECT plan
		FROM organizations
		WHERE id = $1`, organizationID).Scan(&plan)

	if err != nil {
		return "", err
	}

	return plan, nil
}

func (c *Client) CreateOrganization(adminID string) (string, error) {
	var organizationID string
	err := c.db.QueryRow(`
		INSERT INTO organizations (admin_id, plan)
		VALUES ($1, 'FREE')
		RETURNING id`, adminID).Scan(&organizationID)
	if err != nil {
		return "", err
	}

	return organizationID, nil
}

func (c *Client) JoinOrganization(userID string, organizationID string) (string, error) {
	var teacherID string
	err := c.db.QueryRow(`
		INSERT INTO teachers (user_id, organization_id)
		VALUES ($1, $2)
		RETURNING id`, userID, organizationID).Scan(&teacherID)

	if err != nil {
		return "", err
	}

	return teacherID, nil
}

func (c *Client) GetOrganizationByCustomerID(customerID string) (string, error) {
	var organizationID string
	err := c.db.QueryRow(`
		SELECT id
		FROM organizations
		WHERE customer_id = $1`, customerID).Scan(&organizationID)

	if err != nil {
		return "", err
	}

	return organizationID, nil
}

func (c *Client) UpdateOrganization(plan, organizationID, customerID, subscriptionID string, expiration time.Time) error {
	query := `
		UPDATE organizations 
		SET 
			plan = $1,
			customer_id = NULLIF($2, ''),
			subscription_id = NULLIF($3, ''),
			expiration = $4::date,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $5`

	expirationDate := expiration.Format("2006-01-02")

	result, err := c.db.Exec(query, plan, customerID, subscriptionID, expirationDate, organizationID)
	if err != nil {
		return fmt.Errorf("failed to update organization billing: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error checking rows affected: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("no organization found with ID: %s", organizationID)
	}

	return nil
}
