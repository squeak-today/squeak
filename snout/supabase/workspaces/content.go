package workspaces

import (
	"context"
	"fmt"
	"snout/supabase"
	"snout/models/workspaces"
	types "snout/whisker_types"
)

func CreateContent(
	ctx context.Context,
	client *supabase.Client,
	databaseId string,
	name string,
	languageCode types.LanguageCode,
	cefrLevel types.CEFRLevel,
) (string, error) {
	var id string
	err := client.Db.QueryRowContext(ctx, `
		INSERT INTO content (database_id, name, language_code, cefr_level)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, databaseId, name, languageCode, cefrLevel).Scan(&id)
	if err != nil {
		return "", err
	}
	return id, nil
}

func GetContent(ctx context.Context, client *supabase.Client, id string) (workspaces.Content, error) {
	var content workspaces.Content
	err := client.Db.QueryRowContext(ctx, `
		SELECT id, database_id, name, language_code, cefr_level, created_at
		FROM content
		WHERE id = $1
	`, id).Scan(&content.ID, &content.DatabaseID, &content.Name, &content.LanguageCode, &content.CEFRLevel, &content.CreatedAt)
	if err != nil {
		return workspaces.Content{}, err
	}
	return content, nil
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

func GetIncompleteJobs(client *supabase.Client, userId string, databaseId string) ([]types.ContentJob, error) {
	rows, err := client.Db.Query(`
		SELECT id, user_id, database_id, status, name, created_at
		FROM content_jobs
		WHERE user_id = $1 AND database_id = $2 AND status != $3
	`, userId, databaseId, types.ContentJobStatusComplete)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	jobs := []types.ContentJob{}
	for rows.Next() {
		var job types.ContentJob
		err := rows.Scan(&job.ID, &job.UserID, &job.DatabaseID, &job.Status, &job.Name, &job.CreatedAt)
		if err != nil {
			return nil, err
		}
		jobs = append(jobs, job)
	}
	return jobs, nil
}
