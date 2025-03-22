package supabase

import (
	"fmt"
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
		return uuid, err
	}

	return "", fmt.Errorf("teacher doesn't exist with that user id, or organization does not exist")
}

func (c *Client) CheckOrganizationByUserID(userID string) (string, error) {
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
