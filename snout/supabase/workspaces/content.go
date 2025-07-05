package workspaces

import (
	"context"
	"fmt"
	"snout/supabase"

	"whisker/types"
)

func CreateContent(ctx context.Context, client *supabase.Client, databaseId string, name string) (string, error) {
	var id string
	err := client.Db.QueryRowContext(ctx, `
		INSERT INTO content (database_id, name)
		VALUES ($1, $2)
		RETURNING id
	`, databaseId, name).Scan(&id)
	if err != nil {
		return "", err
	}
	return id, nil
}


func CreateContentJob(ctx context.Context, client *supabase.Client, userId string, databaseId string, name string) (string, error) {
	var id string
	err := client.Db.QueryRowContext(ctx, `
		INSERT INTO content_jobs (user_id, database_id, status, name)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, userId, databaseId, types.ContentJobStatusCreation, name).Scan(&id)
	if err != nil {
		return "", err
	}
	return id, nil
}

func UpsertContentJob(ctx context.Context, client *supabase.Client, name string, id string, userId string, databaseId string, status string) error {
	result, err := client.Db.ExecContext(ctx, `
		INSERT INTO content_jobs (id, user_id, database_id, status, name) 
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (id) DO UPDATE
		SET user_id = $2,
			database_id = $3,
			status = $4,
			name = $5
	`, id, userId, databaseId, status, name)
	if err != nil {
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("no rows were inserted or updated")
	}
	return nil
}
