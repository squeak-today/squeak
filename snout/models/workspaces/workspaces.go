package workspaces

type Workspace struct {
	ID   string `json:"id" example:"xxxx-xxxx-xxxx-xxxx"`
	Name string `json:"name" example:"My Workspace"`
}

type GetWorkspacesResponse struct {
	Workspaces []Workspace `json:"workspaces"`
}
