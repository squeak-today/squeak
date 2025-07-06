package workspaces

type CreateDatabaseRequest struct {
	Name string       `json:"name" binding:"required" example:"My Database"`
	Type DatabaseType `json:"type" binding:"required" example:"content"`
}

type CreateDatabaseResponse struct {
	ID string `json:"id" binding:"required" example:"xxxx-xxxx-xxxx-xxxx"`
}

type QueryDatabaseRequest struct {
	Type DatabaseType `json:"type" binding:"required" example:"content"`
}

type QueryDatabaseResponse struct {
	Database
	ContentRows []Content `json:"content"`
}