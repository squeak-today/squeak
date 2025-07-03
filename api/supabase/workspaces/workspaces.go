package workspaces

import (
	models "squeak-api/models/workspaces"
	"squeak-api/supabase"
)

func GetWorkspaces(client *supabase.Client, userId string) ([]models.Workspace, error) {
	workspaces := make([]models.Workspace, 0)

	rows, err := client.Db.Query(`
		SELECT 
        id, name
		FROM workspaces
		WHERE user_id = $1
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
