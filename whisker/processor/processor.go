package processor

import (
	"context"
	"log"
	"time"

	"snout/supabase"
	"snout/supabase/workspaces"
	"whisker/types"
)

type ContentProcessor struct {
	supabaseClient *supabase.Client
}

func NewContentProcessor(supabaseClient *supabase.Client) *ContentProcessor {
	return &ContentProcessor{
		supabaseClient: supabaseClient,
	}
}

func (p *ContentProcessor) Process(ctx context.Context, job *types.ContentJobRecord) error {
	if err := workspaces.UpdateContentJob(ctx, p.supabaseClient, job.ID, job.Job.UserID, job.Job.DatabaseID, string(job.Status)); err != nil {
		return err
	}

	select {
	case <-time.After(20 * time.Second):
		log.Printf("Processed content job for user %s, database %s", job.Job.UserID, job.Job.DatabaseID)
		return workspaces.UpdateContentJob(ctx, p.supabaseClient, job.ID, job.Job.UserID, job.Job.DatabaseID, string(types.ContentJobStatusComplete))
	case <-ctx.Done():
		log.Printf("Content job cancelled for user %s, database %s", job.Job.UserID, job.Job.DatabaseID)
		return ctx.Err()
	}
}
