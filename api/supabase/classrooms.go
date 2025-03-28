package supabase

import (
	"log"
)

func (c *Client) UpdateClassroom(classroomID int, name string) error {
	_, err := c.db.Exec(`
		UPDATE classrooms
		SET name = $1
		WHERE id = $2
	`, name, classroomID)
	if err != nil {
		log.Printf("Failed to update classroom: %v", err)
		return err
	}
	return nil
}
