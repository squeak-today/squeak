package workspaces

import (
	"fmt"
	"snout/supabase"
)

func CheckWorkspaceUserOwnership(client *supabase.Client, userId string, workspaceId string) (bool, error) {
	var exists bool
	err := client.Db.QueryRow(`
		SELECT EXISTS (
			SELECT 1 FROM workspaces WHERE id = $1 AND user_id = $2
		)
	`, workspaceId, userId).Scan(&exists)
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
		)
	`, databaseId, userId, workspaceId).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func CheckDatabaseType(client *supabase.Client, table string, databaseId string) (bool, error) {
	var exists bool
	query := fmt.Sprintf(`
		SELECT EXISTS (
			SELECT 1 FROM %s WHERE id = $1
		)
	`, table)
	err := client.Db.QueryRow(query, databaseId).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}
