package processor

import (
	"context"
	"log"
	"time"

	"snout/supabase"
	"snout/supabase/workspaces"
	"whisker/storage"
	"whisker/types"
)

type ContentProcessor struct {
	supabaseClient *supabase.Client
	s3Client       *storage.S3Client
}

func NewContentProcessor(supabaseClient *supabase.Client, s3Client *storage.S3Client) *ContentProcessor {
	return &ContentProcessor{
		supabaseClient: supabaseClient,
		s3Client:       s3Client,
	}
}

func (p *ContentProcessor) Process(ctx context.Context, job *types.ContentJobRecord) error {
	select {
	case <-time.After(5 * time.Second):
	case <-ctx.Done():
		log.Printf("Content job cancelled for user %s, database %s", job.Job.UserID, job.Job.DatabaseID)
		return ctx.Err()
	}

	content := types.StoredContent{
		Name:     job.Job.Name,
		Markdown: "# Hello World\n\nThis is a placeholder content for testing.",
	}

	select {
	case <-time.After(5 * time.Second):
	case <-ctx.Done():
		return ctx.Err()
	}

	log.Printf("Storing content for user %s, database %s", job.Job.UserID, job.Job.DatabaseID)
	if err := p.s3Client.PutContent(ctx, job.Job.UserID, job.ID, content); err != nil {
		log.Printf("Failed to store content: %v", err)
		return err
	}
	if _, err := workspaces.CreateContent(ctx, p.supabaseClient, job.Job.DatabaseID, job.Job.Name); err != nil {
		log.Printf("Failed to create content: %v", err)
		return err
	}

	log.Printf("Processed content job for user %s, database %s", job.Job.UserID, job.Job.DatabaseID)
	return nil
}
