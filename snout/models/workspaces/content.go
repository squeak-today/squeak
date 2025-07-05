package workspaces

type CreateContentRequest struct {
	Name string `json:"name" binding:"required"`
}
type CreateContentResponse struct{}
