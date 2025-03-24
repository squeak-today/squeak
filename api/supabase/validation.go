package supabase

import (
	"fmt"

)

func (c *Client) GetTeacherInfo(teacherID string) (bool, error) {
	var exists bool
	err := c.db.QueryRow(`
		SELECT EXISTS (
			SELECT 1 
			FROM classrooms
			WHERE teacher_id = $1 
	)`, teacherID).Scan(&exists)

	if err != nil {
		return false, err
	}

	return exists, nil
}

func (c *Client) CheckAdminStatus(userID string) (bool, error) {
	var exists bool
	err := c.db.QueryRow(`
		SELECT EXISTS (
			SELECT 1 
			FROM organizations
			WHERE admin_id = $1
	)`, userID).Scan(&exists)

	if err != nil {
		return false, err
	}

	return exists, nil
}

// set as teacher, student, admin, or none / ""
func (c *Client) CheckAccountType(userID string, accountType string) (bool, error) {
	// teacher check
	exists, err := c.GetTeacherInfo(userID)
	if err != nil {
		return false, fmt.Errorf("failed to check teacher info: %v", err)
	}

	// student check
	studentID, classroomID, err := c.CheckStudentStatus(userID)
	if err != nil {
		return false, fmt.Errorf("failed to check student status: %v", err)
	}

	// admin check
	adminExists, err := c.CheckAdminStatus(userID)
	if err != nil {
		return false, fmt.Errorf("failed to check admin status: %v", err)
	}

	if accountType == "teacher" {
		return exists, nil
	} else if accountType == "student" {
		return (studentID != "" && classroomID != ""), nil
	} else if accountType == "admin" {
		return adminExists, nil
	} else {
		return (studentID == "" && classroomID == "" && !exists && !adminExists), nil
	}
}