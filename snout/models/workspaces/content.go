package workspaces

import (
	types "snout/whisker_types"
)

type Content struct {
	ID         string `json:"id" binding:"required" example:"xxxx-xxxx-xxxx-xxxx"`
	Name       string `json:"name" binding:"required" example:"My Content"`
	DatabaseID string `json:"database_id" binding:"required" example:"xxxx-xxxx-xxxx-xxxx"`
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
