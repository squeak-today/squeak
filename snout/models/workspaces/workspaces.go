package workspaces

type Workspace struct {
	ID   string `json:"id" example:"xxxx-xxxx-xxxx-xxxx"`
	Name string `json:"name" example:"My Workspace"`
}

type DatabaseType string
const (
	DatabaseTypeContent DatabaseType = "content"
)

type ContentDatabase struct {}

type Database struct {
	ID          string `json:"id" example:"xxxx-xxxx-xxxx-xxxx"`
	WorkspaceID string `json:"workspace_id" example:"xxxx-xxxx-xxxx-xxxx"`
	Name        string `json:"name" example:"My Database"`
	Type        DatabaseType `json:"type" example:"content"`
	*ContentDatabase
}

type WorkspacesSummary struct {
	Workspaces []Workspace `json:"workspaces"`
	Databases  []Database  `json:"databases"`
}

type GetWorkspacesResponse struct {
	Workspaces []Workspace `json:"workspaces"`
}
