package workspaces

import (
	types "snout/whisker_types"
	"time"
)

type Content struct {
	ID           string             `json:"id" binding:"required" example:"xxxx-xxxx-xxxx-xxxx"`
	Name         string             `json:"name" binding:"required" example:"My Content"`
	DatabaseID   string             `json:"database_id" binding:"required" example:"xxxx-xxxx-xxxx-xxxx"`
	CEFRLevel    types.CEFRLevel    `json:"cefr_level" binding:"required" example:"A1"`
	LanguageCode types.LanguageCode `json:"language_code" binding:"required" example:"en"`
	CreatedAt    time.Time          `json:"created_at" binding:"required" example:"2021-01-01T00:00:00Z"`
}

type CreateContentRequest struct {
	Name string `json:"name" binding:"required"`

	// Eventually need to build a more robust request body for other
	// kinds of content uploads
	Link string `json:"link" binding:"required"`

	// Content creation parameters
	LanguageCode types.LanguageCode `json:"language_code" binding:"required"`
	CEFRLevel    types.CEFRLevel    `json:"cefr_level" binding:"required"`
}
type CreateContentResponse struct{}

type GetIncompleteJobsResponse struct {
	Jobs []types.ContentJob `json:"jobs"`
}

type GetContentBodyResponse struct {
	PresignedURL string `json:"presigned_url" binding:"required"`
}
