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

func (c *Client) GetOrganizationSubscriptionID(organizationID string) (string, error) {
	var subscriptionID string
	err := c.db.QueryRow(`
		SELECT subscription_id
		FROM organizations
		WHERE id = $1`, organizationID).Scan(&subscriptionID)

	if err != nil {
		return "", err
	}

	return subscriptionID, nil
}

func (c *Client) GetOrganizationInfo(organizationID string) (string, string, string, time.Time, bool, error) {
	var plan string
	var customerID *string
	var subscriptionID *string
	var expiration *time.Time
	var canceled *bool

	err := c.db.QueryRow(`
		SELECT plan, customer_id, subscription_id, expiration, canceled
		FROM organizations
		WHERE id = $1`, organizationID).Scan(&plan, &customerID, &subscriptionID, &expiration, &canceled)

	if err != nil {
		return "", "", "", time.Time{}, false, err
	}

	// convert nullable fields to their zero values if null
	customerIDStr := ""
	if customerID != nil {
		customerIDStr = *customerID
	}

	subscriptionIDStr := ""
	if subscriptionID != nil {
		subscriptionIDStr = *subscriptionID
	}

	expirationTime := time.Time{}
	if expiration != nil {
		expirationTime = *expiration
	}

	canceledBool := false
	if canceled != nil {
		canceledBool = *canceled
	}

	return plan, customerIDStr, subscriptionIDStr, expirationTime, canceledBool, nil
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

func (c *Client) UpdateOrganization(plan, organizationID, customerID, subscriptionID string, expiration time.Time, canceled bool) error {
	var expirationValue interface{}
	if !expiration.IsZero() {
		expirationValue = expiration.Format("2006-01-02")
	} else {
		expirationValue = nil
	}

	query := `
		UPDATE organizations 
		SET 
			plan = $1,
			customer_id = NULLIF($2, ''),
			subscription_id = NULLIF($3, ''),
			expiration = $4,
			canceled = $5,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $6`

	result, err := c.db.Exec(query, plan, customerID, subscriptionID, expirationValue, canceled, organizationID)
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

// CheckOrganizationByUserID returns the organization ID for a user, whether they are a student or teacher
// If the user is a student, it finds their classroom, then the teacher, then the organization
// If the user is a teacher, it directly finds their organization
// Returns empty string if user is neither student nor teacher
func (c *Client) CheckOrganizationByUserID(userID string) (string, error) {
	isStudent, err := c.CheckAccountType(userID, "student")
	if err != nil {
		return "", fmt.Errorf("failed to check if user is a student: %w", err)
	}

	if isStudent {
		_, classroomID, err := c.CheckStudentStatus(userID)
		if err != nil {
			return "", fmt.Errorf("failed to get student's classroom: %w", err)
		}
		if classroomID == "" {
			return "", fmt.Errorf("student doesn't have a classroom")
		}

		teacherID, _, err := c.GetClassroomById(classroomID)
		if err != nil {
			return "", fmt.Errorf("failed to get teacher ID from classroom: %w", err)
		}

		organizationID, err := c.CheckTeacherOrganization(teacherID)
		if err != nil {
			return "", fmt.Errorf("failed to get organization ID from teacher: %w", err)
		}

		return organizationID, nil
	}

	isTeacher, err := c.CheckAccountType(userID, "teacher")
	if err != nil {
		return "", fmt.Errorf("failed to check if user is a teacher: %w", err)
	}

	if isTeacher {
		organizationID, err := c.CheckTeacherOrganizationByUserID(userID)
		if err != nil {
			return "", fmt.Errorf("failed to get organization ID for teacher: %w", err)
		}
		return organizationID, nil
	}

	return "", nil
}
