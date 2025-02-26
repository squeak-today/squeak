package models

type StudentStatusResponse struct {
	StudentID   string `json:"student_id" binding:"required" example:"123"`
	ClassroomID string `json:"classroom_id" binding:"required" example:"456"`
}

type GetStudentClassroomResponse struct {
	TeacherID     string `json:"teacher_id" binding:"required" example:"789"`
	StudentsCount int    `json:"students_count" binding:"required" example:"10"`
}

type JoinClassroomRequest struct {
	ClassroomID string `json:"classroom_id" binding:"required" example:"123"`
}

type JoinClassroomResponse struct {
	Message string `json:"message" binding:"required" example:"Student added to classroom successfully"`
}
