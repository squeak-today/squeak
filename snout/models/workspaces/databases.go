package workspaces

type CreateDatabaseRequest struct {
	Name string `json:"name" binding:"required" example:"My Database"`
}

type CreateDatabaseResponse struct {
	ID string `json:"id" binding:"required" example:"xxxx-xxxx-xxxx-xxxx"`
}

type QueryDatabaseResponse struct {
	Database
	Content []Content `json:"content"`
}

type DeleteDatabaseResponse struct{}
