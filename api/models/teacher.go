package models

type TeacherStatusResponse struct {
	Exists bool `json:"exists" binding:"required" example:"true"`
}

type GetClassroomInfoResponse struct {
	ClassroomID   string `json:"classroom_id" binding:"required" example:"123"`
	StudentsCount int    `json:"students_count" binding:"gte=0" example:"10"`
}

type ClassroomContentItem struct {
	ID          string  `json:"id" binding:"required" example:"2479"`
	CEFRLevel   string  `json:"cefr_level" binding:"required" example:"B1"`
	ContentType string  `json:"content_type" binding:"required" example:"News"`
	CreatedAt   string  `json:"created_at" binding:"required" example:"2025-02-26T13:01:13.390612Z"`
	DateCreated string  `json:"date_created" binding:"required" example:"2025-02-26"`
	Language    string  `json:"language" binding:"required" example:"French"`
	Pages       int     `json:"pages" binding:"required" example:"10"`
	PreviewText string  `json:"preview_text" binding:"required" example:"# L'actualité musicale en bref\n\n## Un flot de nouveautés..."`
	Title       string  `json:"title" binding:"required" example:"# L'actualité musicale en bref\n\n## Un fl..."`
	Topic       string  `json:"topic" binding:"required" example:"Music"`
}

type QueryClassroomContentResponse []ClassroomContentItem

type CreateClassroomRequest struct {
	StudentsCount int `json:"students_count" binding:"gte=0" example:"10"`
}

type CreateClassroomResponse struct {
	ClassroomID string `json:"classroom_id" binding:"required" example:"123"`
}

type AcceptContentRequest struct {
	ContentType string `json:"content_type" binding:"required" example:"News"`
	ContentID   int    `json:"content_id" binding:"gte=0" example:"123"`
}

type AcceptContentResponse struct {
	Message string `json:"message" binding:"required" example:"Content accepted successfully"`
}

type RejectContentRequest struct {
	ContentType string `json:"content_type" binding:"required" example:"News"`
	ContentID   int     `json:"content_id" binding:"gte=0" example:"123"`
}

type RejectContentResponse struct {
	Message string `json:"message" binding:"required" example:"Content rejected successfully"`
}

type GetStudentProfilesResponse struct {
    Count    int                 `json:"count" binding:"required" example:"3"`
    Profiles []GetProfileResponse `json:"profiles" binding:"required"`
}

type RemoveStudentRequest struct {
    StudentID string `json:"student_id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000"`
}

type RemoveStudentResponse struct {
    Message string `json:"message" binding:"required" example:"Student removed successfully"`
}

type GetProblemAreasResponse struct {
    ProblemAreas []ProblemArea `json:"problemAreas"`
}

type ProblemArea struct {
    ID            int     `json:"id" example:"1"`
    Question      string  `json:"question" example:"What is the capital of France?"`
    IncorrectRate float64 `json:"incorrectRate" example:"75.5"`
}