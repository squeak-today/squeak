package workspaces

import (
	models "snout/models/workspaces"
	"snout/supabase"
)

func GetWorkspaces(client *supabase.Client, userId string) ([]models.Workspace, error) {
	workspaces := make([]models.Workspace, 0)

	rows, err := client.Db.Query(`
		SELECT 
        id, name
		FROM workspaces
		WHERE user_id = $1
		AND soft_delete = 'no'
	`, userId)
	if err != nil {
		return workspaces, err
	}
	defer rows.Close()

	for rows.Next() {
		var workspace models.Workspace
		err = rows.Scan(&workspace.ID, &workspace.Name)
		if err != nil {
			return workspaces, err
		}
		workspaces = append(workspaces, workspace)
	}

	return workspaces, nil
}

func CreateWorkspace(client *supabase.Client, userId string, name string) (string, error) {
	var id string
	err := client.Db.QueryRow(`
		INSERT INTO workspaces (user_id, name)
		VALUES ($1, $2)
		RETURNING id
	`, userId, name).Scan(&id)
	if err != nil {
		return "", err
	}
	return id, nil
}

func GetWorkspacesSummary(client *supabase.Client, userId string) (models.WorkspacesSummary, error) {
	workspaces := make([]models.Workspace, 0)
	databases := make([]models.Database, 0)

	workspaceRows, err := client.Db.Query(`
		SELECT id, name
		FROM workspaces
		WHERE user_id = $1
		AND soft_delete = 'no'
		ORDER BY name
	`, userId)
	if err != nil {
		return models.WorkspacesSummary{}, err
	}
	defer workspaceRows.Close()

	for workspaceRows.Next() {
		var workspace models.Workspace
		err = workspaceRows.Scan(&workspace.ID, &workspace.Name)
		if err != nil {
			return models.WorkspacesSummary{}, err
		}
		workspaces = append(workspaces, workspace)
	}

	databaseRows, err := client.Db.Query(`
		SELECT id, workspace_id, name
		FROM content_databases
		WHERE user_id = $1
		AND soft_delete = 'no'
		ORDER BY name
	`, userId)
	if err != nil {
		return models.WorkspacesSummary{}, err
	}
	defer databaseRows.Close()

	for databaseRows.Next() {
		var database models.Database
		err = databaseRows.Scan(&database.ID, &database.WorkspaceID, &database.Name)
		if err != nil {
			return models.WorkspacesSummary{}, err
		}
		database.Type = models.DatabaseTypeContent
		database.ContentDatabase = &models.ContentDatabase{}
		databases = append(databases, database)
	}

	return models.WorkspacesSummary{
		Workspaces: workspaces,
		Databases:  databases,
	}, nil
}
