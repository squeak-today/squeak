package workspaces

import (
	"fmt"
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
		databases = append(databases, database)
	}

	return models.WorkspacesSummary{
		Workspaces: workspaces,
		Databases:  databases,
	}, nil
}

func GetDeletedSummary(client *supabase.Client, userId string) (models.DeletedSummary, error) {
	workspaces := make([]models.Workspace, 0)
	databases := make([]models.Database, 0)
	contents := make([]models.Content, 0)

	workspaceRows, err := client.Db.Query(`
		SELECT id, name
		FROM workspaces
		WHERE user_id = $1
		AND soft_delete = $2
		ORDER BY name
	`, userId, models.SoftDeleteStatusSoftDelete)
	if err != nil {
		return models.DeletedSummary{}, err
	}
	defer workspaceRows.Close()

	for workspaceRows.Next() {
		var workspace models.Workspace
		err = workspaceRows.Scan(&workspace.ID, &workspace.Name)
		if err != nil {
			return models.DeletedSummary{}, err
		}
		workspaces = append(workspaces, workspace)
	}

	databaseRows, err := client.Db.Query(`
		SELECT id, workspace_id, name
		FROM content_databases
		WHERE user_id = $1
		AND soft_delete = $2
		ORDER BY name
	`, userId, models.SoftDeleteStatusSoftDelete)
	if err != nil {
		return models.DeletedSummary{}, err
	}
	defer databaseRows.Close()

	for databaseRows.Next() {
		var database models.Database
		err = databaseRows.Scan(&database.ID, &database.WorkspaceID, &database.Name)
		if err != nil {
			return models.DeletedSummary{}, err
		}
		databases = append(databases, database)

		contentRows, err := client.Db.Query(`
			SELECT id, name, database_id, cefr_level, language_code, created_at
			FROM content
			WHERE database_id = $1
			AND soft_delete = $2
		`, database.ID, models.SoftDeleteStatusSoftDelete)
		if err != nil {
			return models.DeletedSummary{}, err
		}
		defer contentRows.Close()

		for contentRows.Next() {
			var content models.Content
			err = contentRows.Scan(&content.ID, &content.Name, &content.DatabaseID, &content.CEFRLevel, &content.LanguageCode, &content.CreatedAt)
			if err != nil {
				return models.DeletedSummary{}, err
			}
			contents = append(contents, content)
		}
	}

	return models.DeletedSummary{
		Workspaces: workspaces,
		Databases:  databases,
		Contents:   contents,
	}, nil
}

func SetWorkspaceSoftDelete(client *supabase.Client, userId string, id string, status models.SoftDeleteStatus) error {
	result, err := client.Db.Exec(`
		UPDATE workspaces
		SET soft_delete = $3
		WHERE id = $1
		AND user_id = $2
	`, id, userId, status)
	if err != nil {
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("no rows were deleted")
	}

	result, err = client.Db.Exec(`
		UPDATE content_databases
		SET soft_delete = $2
		WHERE workspace_id = $1
	`, id, status)
	if err != nil {
		return err
	}
	rowsAffected, err = result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected > 0 {
		rows, err := client.Db.Query(`
			SELECT id 
			FROM content_databases
			WHERE workspace_id = $1
		`, id)
		if err != nil {
			return err
		}
		defer rows.Close()

		var databaseIds []string
		for rows.Next() {
			var dbId string
			if err := rows.Scan(&dbId); err != nil {
				return err
			}
			databaseIds = append(databaseIds, dbId)
		}

		if len(databaseIds) > 0 {
			_, err = client.Db.Exec(`
				UPDATE content 
				SET soft_delete = $2
				WHERE database_id = ANY($1)
			`, databaseIds, status)
			if err != nil {
				return err
			}
		}
	}

	return nil
}
