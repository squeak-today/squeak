package workspaces

type Workspace struct {
	ID   string `json:"id" example:"xxxx-xxxx-xxxx-xxxx"`
	Name string `json:"name" example:"My Workspace"`
}

type DatabaseType string

const (
	DatabaseTypeContent DatabaseType = "content"
)

type ContentDatabase struct{}

type Database struct {
	ID          string       `json:"id" binding:"required" example:"xxxx-xxxx-xxxx-xxxx"`
	WorkspaceID string       `json:"workspace_id" binding:"required" example:"xxxx-xxxx-xxxx-xxxx"`
	Name        string       `json:"name" binding:"required" example:"My Database"`
	Type        DatabaseType `json:"type" binding:"required" example:"content"`
	*ContentDatabase
}

type WorkspacesSummary struct {
	Workspaces []Workspace `json:"workspaces" binding:"required"`
	Databases  []Database  `json:"databases" binding:"required"`
}

type GetWorkspacesResponse struct {
	Workspaces []Workspace `json:"workspaces"`
}
