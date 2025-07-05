package types

import (
	"fmt"
	"time"
)

type ContentJobStatus string

const (
	ContentJobStatusCreation  ContentJobStatus = "creation"
	ContentJobStatusPending   ContentJobStatus = "pending"
	ContentJobStatusRunning   ContentJobStatus = "running"
	ContentJobStatusComplete  ContentJobStatus = "complete"
	ContentJobStatusFailed    ContentJobStatus = "failed"
	ContentJobStatusCancelled ContentJobStatus = "cancelled"
)

type ContentJob struct {
	Name       string `json:"name" required:"true"`
	UserID     string `json:"user_id" required:"true"`
	DatabaseID string `json:"database_id" required:"true"`
}

func ValidateContentJob(job *ContentJob) error {
	if job == nil {
		return fmt.Errorf("content job is nil")
	}
	if job.Name == "" {
		return fmt.Errorf("name is required")
	}
	if job.UserID == "" {
		return fmt.Errorf("user_id is required")
	}
	if job.DatabaseID == "" {
		return fmt.Errorf("database_id is required")
	}
	return nil
}

// SQS and /create request body
type ContentJobRequest struct {
	ID  string     `json:"id" required:"true"`
	Job ContentJob `json:"job" required:"true"`
}

// Stored in worker pool as records
type ContentJobRecord struct {
	ID        string           `json:"id" required:"true"`
	Status    ContentJobStatus `json:"status" required:"true"`
	CreatedAt time.Time        `json:"created_at" required:"true"`
	Error     error            `json:"error,omitempty"`
	Job       ContentJob       `json:"job" required:"true"`
}

func ValidateContentJobRecord(record *ContentJobRecord) error {
	if record == nil {
		return fmt.Errorf("content job record is nil")
	}
	if record.ID == "" {
		return fmt.Errorf("id is required")
	}
	if record.Status == "" {
		return fmt.Errorf("status is required")
	}
	if record.CreatedAt.IsZero() {
		return fmt.Errorf("created_at is required")
	}
	if err := ValidateContentJob(&record.Job); err != nil {
		return fmt.Errorf("invalid job: %w", err)
	}
	return nil
}
