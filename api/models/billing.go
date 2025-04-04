package models

import "time"

type BillingAccountResponse struct {
	Plan       string    `json:"plan" binding:"required" example:"PRO"`
	Expiration time.Time `json:"expiration" binding:"required" example:"2025-01-01T00:00:00Z"`
	Canceled   bool      `json:"canceled" binding:"required" example:"false"`
}

type CreateIndividualCheckoutSessionRequest struct {}

type CreateIndividualCheckoutSessionResponse struct {
	RedirectUrl string `json:"redirect_url" binding:"required" example:"https://checkout.stripe.com/c/pay/123"`
}

type CancelIndividualSubscriptionRequest struct {}

type CancelIndividualSubscriptionResponse struct {
	Success bool `json:"success" binding:"required" example:"true"`
	CurrentExpiration string `json:"current_expiration" binding:"required" example:"2025-03-24T12:00:00Z"`
	CanceledPlan string `json:"canceled_plan" binding:"required" example:"PREMIUM"`
}

type BillingAccountUsageResponse struct {
	NaturalTTSUsage int `json:"natural_tts_usage" binding:"required" example:"10"`
	MaxNaturalTTSUsage int `json:"max_natural_tts_usage" binding:"required" example:"100"`
	PremiumSTTUsage int `json:"premium_stt_usage" binding:"required" example:"10"`
	MaxPremiumSTTUsage int `json:"max_premium_stt_usage" binding:"required" example:"100"`
}
