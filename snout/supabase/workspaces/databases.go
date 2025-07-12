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

func QueryContentDatabase(client *supabase.Client, databaseId string) (workspaces.Database, []workspaces.Content, error) {
	log.Println("Querying content database:", databaseId)
	var database workspaces.Database
	err := client.Db.QueryRow(`
		SELECT id, name, workspace_id FROM content_databases
		WHERE id = $1
		AND soft_delete = 'no'
	`, databaseId).Scan(&database.ID, &database.Name, &database.WorkspaceID)
	if err != nil {
		return workspaces.Database{}, nil, err
	}
	database.Type = workspaces.DatabaseTypeContent
	database.ContentDatabase = &workspaces.ContentDatabase{}

	rows, err := client.Db.Query(`
		SELECT id, name, database_id, cefr_level, language_code, created_at FROM content
		WHERE database_id = $1
		AND soft_delete = 'no'
	`, databaseId)
	if err != nil {
		return workspaces.Database{}, nil, err
	}
	defer rows.Close()

	var contents []workspaces.Content
	for rows.Next() {
		var content workspaces.Content
		err = rows.Scan(
			&content.ID,
			&content.Name,
			&content.DatabaseID,
			&content.CEFRLevel,
			&content.LanguageCode,
			&content.CreatedAt,
		)
		if err != nil {
			return workspaces.Database{}, nil, err
		}
		contents = append(contents, content)
	}
	return database, contents, nil
}
