package models

type ERROR_CODE string

const (
	PROFILE_NOT_FOUND   ERROR_CODE = "PROFILE_NOT_FOUND"
	NO_TRANSCRIPT       ERROR_CODE = "NO_TRANSCRIPT"
	AUTH_REQUIRED       ERROR_CODE = "AUTH_REQUIRED"
	USAGE_LIMIT_REACHED ERROR_CODE = "USAGE_LIMIT_REACHED"
	USAGE_RESTRICTED    ERROR_CODE = "USAGE_RESTRICTED"
)

type ErrorResponse struct {
	Error string     `json:"error" binding:"required" example:"Something went wrong"`
	Code  ERROR_CODE `json:"code" enums:"PROFILE_NOT_FOUND,NO_TRANSCRIPT,AUTH_REQUIRED,USAGE_LIMIT_REACHED,USAGE_RESTRICTED" example:"PROFILE_NOT_FOUND"`
}
