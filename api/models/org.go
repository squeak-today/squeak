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

type CancelSubscriptionResponse struct {
	Success bool `json:"success" binding:"required" example:"true"`
	CurrentExpiration string `json:"current_expiration" binding:"required" example:"2025-03-24T12:00:00Z"`
	CanceledPlan string `json:"canceled_plan" binding:"required" example:"STANDARD"`
}