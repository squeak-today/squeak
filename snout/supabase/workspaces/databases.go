package workspaces

import (
	"fmt"
	"log"
	"snout/supabase"

	"snout/models/workspaces"
)

func CreateContentDatabase(client *supabase.Client, userId string, workspaceId string, name string) (string, error) {
	var id string
	err := client.Db.QueryRow(`
		INSERT INTO content_databases (workspace_id, name, user_id)
		VALUES ($1, $2, $3)
		RETURNING id
	`, workspaceId, name, userId).Scan(&id)
	if err != nil {
		log.Println("Error creating content database:", err)
		return "", err
	}
	return id, nil
}

func CreateDatabase(client *supabase.Client, dbType workspaces.DatabaseType, userId string, workspaceId string, name string) (string, error) {
	switch dbType {
	case workspaces.DatabaseTypeContent:
		return CreateContentDatabase(client, userId, workspaceId, name)
	default:
		return "", fmt.Errorf("unsupported database type for creation: %s", dbType)
	}
}
