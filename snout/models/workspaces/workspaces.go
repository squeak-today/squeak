package workspaces

type SoftDeleteStatus string

const (
	SoftDeleteStatusNo         SoftDeleteStatus = "no"
	SoftDeleteStatusSoftDelete SoftDeleteStatus = "soft_delete"
	SoftDeleteStatusHardDelete SoftDeleteStatus = "hard_delete"
)

type DeleteType string

const (
	DeleteTypeSoftDelete DeleteType = "soft_delete"
	DeleteTypeHardDelete DeleteType = "hard_delete"
)

type Workspace struct {
	ID   string `json:"id" binding:"required" example:"xxxx-xxxx-xxxx-xxxx"`
	Name string `json:"name" binding:"required" example:"My Workspace"`
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

type CreateWorkspaceRequest struct {
	Name string `json:"name" binding:"required" example:"My Workspace"`
}
type CreateWorkspaceResponse struct {
	ID string `json:"id" binding:"required" example:"xxxx-xxxx-xxxx-xxxx"`
}

type GetWorkspacesResponse struct {
	Workspaces []Workspace `json:"workspaces" binding:"required"`
}
