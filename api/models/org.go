package models

type OrganizationResponse struct {
	OrganizationID string `json:"organization_id" binding:"required" example:"123"`
	TeacherID      string `json:"teacher_id" binding:"required" example:"123"`
}

type OrganizationPlanResponse struct {
	Plan string `json:"plan" binding:"required" example:"FREE"`
}

type CreateOrganizationRequest struct {}

type CreateOrganizationResponse struct {
	OrganizationID string `json:"organization_id" binding:"required" example:"123"`
	TeacherID      string `json:"teacher_id" binding:"required" example:"123"`
}

type JoinOrganizationRequest struct {
	OrganizationID string `json:"organization_id" binding:"required" example:"123"`
}

type JoinOrganizationResponse struct {
	TeacherID string `json:"teacher_id" binding:"required" example:"123"`
}

type PaymentsResponse struct {
	Success bool `json:"success" binding:"required" example:"true"`
}
