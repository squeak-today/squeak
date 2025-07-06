package workspaces

type Content struct {
	ID         string `json:"id" binding:"required" example:"xxxx-xxxx-xxxx-xxxx"`
	Name       string `json:"name" binding:"required" example:"My Content"`
	DatabaseID string `json:"database_id" binding:"required" example:"xxxx-xxxx-xxxx-xxxx"`
}

type CreateContentRequest struct {
	Name string `json:"name" binding:"required"`
}
type CreateContentResponse struct{}
