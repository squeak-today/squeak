package workspaces

import (
	"fmt"
	"snout/supabase"

	"snout/models/workspaces"
)

func CreateContentDatabase(client *supabase.Client, workspaceId string, name string) (string, error) {
	var id string
	err := client.Db.QueryRow(`
		INSERT INTO content_databases (workspace_id, name)
		VALUES ($1, $2)
		RETURNING id
	`, workspaceId, name).Scan(&id)
	if err != nil {
		return "", err
	}
	return id, nil
}

func CreateDatabase(client *supabase.Client, dbType workspaces.DatabaseType, workspaceId string, name string) (string, error) {
	switch dbType {
	case workspaces.DatabaseTypeContent:
		return CreateContentDatabase(client, workspaceId, name)
	default:
		return "", fmt.Errorf("unsupported database type for creation: %s", dbType)
	}
}