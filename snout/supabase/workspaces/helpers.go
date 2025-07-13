package workspaces

import (
	"fmt"
	workspaces_models "snout/models/workspaces"
	"snout/supabase"
)

func CheckWorkspaceUserOwnership(client *supabase.Client, userId string, workspaceId string) (bool, error) {
	var exists bool
	err := client.Db.QueryRow(`
		SELECT EXISTS (
			SELECT 1 FROM workspaces WHERE id = $1 AND user_id = $2
			AND (
				soft_delete = $3 OR
				soft_delete = $4
			)
		)
	`, workspaceId, userId, workspaces_models.SoftDeleteStatusNo, workspaces_models.SoftDeleteStatusSoftDelete).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func CheckDatabaseUserOwnership(client *supabase.Client, userId string, workspaceId string, databaseId string) (bool, error) {
	var exists bool
	err := client.Db.QueryRow(`
		SELECT EXISTS (
			SELECT 1 FROM content_databases WHERE id = $1 AND user_id = $2 AND workspace_id = $3
			AND (
				soft_delete = $4 OR
				soft_delete = $5
			)
		)
	`, databaseId, userId, workspaceId, workspaces_models.SoftDeleteStatusNo, workspaces_models.SoftDeleteStatusSoftDelete).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func CheckContentInDatabase(client *supabase.Client, databaseId string, contentId string) (bool, error) {
	var exists bool
	err := client.Db.QueryRow(`
		SELECT EXISTS (
			SELECT 1 FROM content WHERE id = $1 AND database_id = $2
			AND (
				soft_delete = $3 OR
				soft_delete = $4
			)
		)
	`, contentId, databaseId, workspaces_models.SoftDeleteStatusNo, workspaces_models.SoftDeleteStatusSoftDelete).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

// PLEASE ENSURE THAT THE TABLE IS NOT USER PROVIDED
// VALIDATE THE INPUT
func CheckDatabaseType(client *supabase.Client, table string, databaseId string) (bool, error) {
	var exists bool
	query := fmt.Sprintf(`
		SELECT EXISTS (
			SELECT 1 FROM %s WHERE id = $1
			AND (
				soft_delete = $2 OR
				soft_delete = $3
			)
		)
	`, table)
	err := client.Db.QueryRow(query, databaseId, workspaces_models.SoftDeleteStatusNo, workspaces_models.SoftDeleteStatusSoftDelete).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func CheckWorkspaceNotDeleted(client *supabase.Client, userId string, workspaceId string) (bool, error) {
	var valid bool
	err := client.Db.QueryRow(`
		SELECT EXISTS (
			SELECT 1 FROM workspaces 
			WHERE id = $1 
			AND user_id = $2 
			AND soft_delete = $3
		)
	`, workspaceId, userId, workspaces_models.SoftDeleteStatusNo).Scan(&valid)
	if err != nil {
		return false, err
	}
	return valid, nil
}

func CheckDatabaseNotDeleted(client *supabase.Client, userId string, databaseId string) (bool, error) {
	var valid bool
	err := client.Db.QueryRow(`
		SELECT EXISTS (
			SELECT 1 FROM content_databases 
			WHERE id = $1 
			AND user_id = $2 
			AND soft_delete = $3
		)
	`, databaseId, userId, workspaces_models.SoftDeleteStatusNo).Scan(&valid)
	if err != nil {
		return false, err
	}
	return valid, nil
}
