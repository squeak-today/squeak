package supabase

import (
	"log"
	"story-api/models"
)

func (c *Client) GetClassroomList(teacherID string) ([]models.ClassroomListItem, error) {
	rows, err := c.db.Query("SELECT id, name, student_count FROM classrooms WHERE teacher_id = $1", teacherID)
	if err != nil {
		log.Printf("Failed to get classroom list: %v", err)
		return nil, err
	}
	defer rows.Close()

	var classrooms []models.ClassroomListItem
	for rows.Next() {
		var classroom models.ClassroomListItem
		err = rows.Scan(&classroom.ClassroomID, &classroom.Name, &classroom.StudentsCount)
		if err != nil {
			log.Printf("Failed to scan classroom: %v", err)
			return nil, err
		}
		classrooms = append(classrooms, classroom)
	}

	return classrooms, nil
}
