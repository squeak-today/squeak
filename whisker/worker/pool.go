package worker

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"snout/supabase"
	"snout/supabase/workspaces"
	"whisker/processor"
	"whisker/types"
)

type Pool struct {
	maxWorkers     int
	processor      *processor.ContentProcessor
	activeJobs     map[string]*types.ContentJobRecord
	mu             sync.RWMutex
	ctx            context.Context
	supabaseClient *supabase.Client
	wg             sync.WaitGroup
}

func NewPool(ctx context.Context, maxWorkers int, processor *processor.ContentProcessor, supabaseClient *supabase.Client) *Pool {
	return &Pool{
		maxWorkers:     maxWorkers,
		processor:      processor,
		activeJobs:     make(map[string]*types.ContentJobRecord),
		ctx:            ctx,
		supabaseClient: supabaseClient,
	}
}

func (p *Pool) ProcessJob(jobRequest *types.ContentJobRequest, onComplete func(success bool)) error {
	select {
	case <-p.ctx.Done():
		return fmt.Errorf("worker pool is shutting down")
	default:
	}

	p.mu.Lock()
	if len(p.activeJobs) >= p.maxWorkers {
		p.mu.Unlock()
		return fmt.Errorf("max concurrent jobs reached (%d)", p.maxWorkers)
	}

	job := &types.ContentJobRecord{
		ID:        jobRequest.ID,
		Status:    types.ContentJobStatusPending,
		CreatedAt: time.Now(),
		Job:       jobRequest.Job,
	}

	if err := workspaces.UpsertContentJob(p.ctx, p.supabaseClient, job.Job.Name, job.ID, job.Job.UserID, job.Job.DatabaseID, string(job.Status)); err != nil {
		p.mu.Unlock()
		return fmt.Errorf("failed to update job status to pending: %w", err)
	}

	p.activeJobs[job.ID] = job
	p.wg.Add(1)
	p.mu.Unlock()

	go func() {
		defer func() {
			p.mu.Lock()
			delete(p.activeJobs, job.ID)
			p.mu.Unlock()
			p.wg.Done()
		}()

		job.Status = types.ContentJobStatusRunning
		if err := workspaces.UpsertContentJob(p.ctx, p.supabaseClient, job.Job.Name, job.ID, job.Job.UserID, job.Job.DatabaseID, string(job.Status)); err != nil {
			log.Printf("Failed to update job status to running: %v", err)
			if onComplete != nil {
				onComplete(false)
			}
			return
		}

		jobCtx, jobCancel := context.WithTimeout(p.ctx, 30*time.Minute)
		defer jobCancel()

		var success bool
		if err := p.processor.Process(jobCtx, job); err != nil {
			if err == context.Canceled {
				log.Printf("Job %s was cancelled", job.ID)
				job.Status = types.ContentJobStatusCancelled
			} else if err == context.DeadlineExceeded {
				log.Printf("Job %s timed out", job.ID)
				job.Status = types.ContentJobStatusFailed
			} else {
				log.Printf("Job %s failed: %v", job.ID, err)
				job.Status = types.ContentJobStatusFailed
			}
			job.Error = err
			success = false
		} else {
			log.Printf("Job %s completed successfully", job.ID)
			job.Status = types.ContentJobStatusComplete
			success = true
		}

		if err := workspaces.UpsertContentJob(p.ctx, p.supabaseClient, job.Job.Name, job.ID, job.Job.UserID, job.Job.DatabaseID, string(job.Status)); err != nil {
			log.Printf("Failed to update final job status: %v", err)
		}

		if onComplete != nil {
			onComplete(success)
		}
	}()

	return nil
}

func (p *Pool) Stop() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	done := make(chan struct{})
	go func() {
		p.wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		log.Printf("All jobs completed gracefully")
	case <-ctx.Done():
		log.Printf("Shutdown timed out with some jobs still running")
	}

	p.mu.Lock()
	activeCount := len(p.activeJobs)
	p.mu.Unlock()
	log.Printf("Worker pool stopped with %d unfinished routines", activeCount)
}

func (p *Pool) ActiveJobs() int {
	p.mu.RLock()
	defer p.mu.RUnlock()
	return len(p.activeJobs)
}
