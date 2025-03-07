package models

type ErrorResponse struct {
	Error string `json:"error" binding:"required" example:"Something went wrong"`
	Code  string `json:"code" example:"PROFILE_NOT_FOUND"`
}
