package models

type TeacherStatusResponse struct {
	Exists bool `json:"exists" example:"true"`
}

type GetClassroomInfoResponse struct {
	ClassroomID   string `json:"classroom_id" example:"123"`
	StudentsCount int    `json:"students_count" example:"10"`
}

type ClassroomContentItem struct {
	ID          string  `json:"id" binding:"required" example:"2479"`
	CEFRLevel   string  `json:"cefr_level" binding:"required" example:"B1"`
	ContentType *string `json:"content_type" example:"News"`
	CreatedAt   string  `json:"created_at" binding:"required" example:"2025-02-26T13:01:13.390612Z"`
	DateCreated string  `json:"date_created" binding:"required" example:"2025-02-26"`
	Language    string  `json:"language" binding:"required" example:"French"`
	Pages       *int    `json:"pages" example:"10"`
	PreviewText string  `json:"preview_text" binding:"required" example:"# L'actualité musicale en bref\n\n## Un flot de nouveautés..."`
	Title       string  `json:"title" binding:"required" example:"# L'actualité musicale en bref\n\n## Un fl..."`
	Topic       string  `json:"topic" binding:"required" example:"Music"`
}

type QueryClassroomContentResponse []ClassroomContentItem

type CreateClassroomRequest struct {
	StudentsCount int `json:"students_count" binding:"required" example:"10"`
}

type CreateClassroomResponse struct {
	ClassroomID string `json:"classroom_id" binding:"required" example:"123"`
}