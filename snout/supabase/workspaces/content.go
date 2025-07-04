package workspaces

import (
	"context"
	"fmt"
	"snout/supabase"
)

func UpsertContentJob(ctx context.Context, client *supabase.Client, userId string, databaseId string, status string) error {
	result, err := client.Db.ExecContext(ctx, `
		INSERT INTO content_jobs (user_id, database_id, status)
		VALUES ($1, $2, $3)
		ON CONFLICT (database_id) DO UPDATE SET status = $3
	`, userId, databaseId, status)
	if err != nil {
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("no rows were inserted")
	}
	return nil
}