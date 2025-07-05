package workspaces

import (
	"context"
	"fmt"
	"snout/supabase"

	"whisker/types"
)

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

func UpdateContentJob(ctx context.Context, client *supabase.Client, id string, userId string, databaseId string, status string) error {
	result, err := client.Db.ExecContext(ctx, `
		UPDATE content_jobs
		SET user_id = $1, database_id = $2, status = $3
		WHERE id = $4
	`, userId, databaseId, status, id)
	if err != nil {
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("no rows were updated")
	}
	return nil
}
