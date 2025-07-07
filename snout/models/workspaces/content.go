package workspaces

import (
	whisker "whisker/types"
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
}
type CreateContentResponse struct{}

type GetIncompleteJobsResponse struct {
	Jobs []whisker.ContentJob `json:"jobs"`
}
