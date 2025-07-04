package types

import "time"

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
	UserID     string
	DatabaseID string
}

// SQS and /create request body
type ContentJobRequest struct {
	Job ContentJob
}

// Stored in worker pool as records
type ContentJobRecord struct {
	ID        string
	Status    ContentJobStatus
	CreatedAt time.Time
	Error     error
	Job       ContentJob
}
