package models

type WebhookResponse struct {
	Received bool   `json:"received"`
	Type     string `json:"type"`
}
