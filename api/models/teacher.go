package models

type TeacherStatusResponse struct {
	Exists bool `json:"exists" example:"true"`
}

type GetClassroomInfoResponse struct {
	ClassroomID string `json:"classroom_id" example:"123"`
	StudentsCount int `json:"students_count" example:"10"`
}
