package workspaces

type CreateDatabaseRequest struct {
	WorkspaceID string `json:"workspace_id" binding:"required" example:"xxxx-xxxx-xxxx-xxxx"`
	Name        string `json:"name" binding:"required" example:"My Database"`
	Type        DatabaseType `json:"type" binding:"required" example:"content"`
}

type CreateDatabaseResponse struct {
	ID string `json:"id" binding:"required" example:"xxxx-xxxx-xxxx-xxxx"`
}