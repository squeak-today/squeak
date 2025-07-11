package models

import "snout/whisker_types"

// TypesResponse is a unifying response type used solely for exporting types to swagger documentation
// This endpoint should never be called in production - it exists only for type generation
type TypesResponse struct {
	StoredContent *whisker_types.StoredContent `json:"stored_content,omitempty"`
}
