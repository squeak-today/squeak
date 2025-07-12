package models

type AudioHealthResponse struct {
	Status string `json:"status" binding:"required" example:"live"`
}

type AudiobookResponse struct {
	URL       string `json:"url" binding:"required" example:"https://bucket.s3.amazonaws.com/path/to/file?signed-params"`
	ExpiresIn int    `json:"expires_in" binding:"required" example:"300"`
}
