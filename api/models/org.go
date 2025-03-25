package models

type OrganizationResponse struct {
	OrganizationID string `json:"organization_id" binding:"required" example:"123"`
	TeacherID      string `json:"teacher_id" binding:"required" example:"123"`
	Plan           string `json:"plan" binding:"required" example:"FREE"`
	ExpirationDate string `json:"expiration_date" example:"2025-03-24T12:00:00Z"`
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

type CancelSubscriptionRequest struct {}

type CancelSubscriptionResponse struct {
	Success bool `json:"success" binding:"required" example:"true"`
	CurrentExpiration string `json:"current_expiration" binding:"required" example:"2025-03-24T12:00:00Z"`
	CanceledPlan string `json:"canceled_plan" binding:"required" example:"CLASSROOM"`
}

type CreateCheckoutSessionRequest struct {}

type CreateCheckoutSessionResponse struct {
	RedirectUrl string `json:"redirect_url" binding:"required" example:"https://checkout.stripe.com/c/pay/123"`
}
