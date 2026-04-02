package worker

import (
	"context"
)

// TaskProcessor processes a single task
type TaskProcessor struct {
	ctx context.Context
}

// NewTaskProcessor creates a new task processor
func NewTaskProcessor(ctx context.Context) *TaskProcessor {
	return &TaskProcessor{ctx: ctx}
}

// Process processes a task
func (p *TaskProcessor) Process(taskID string) error {
	// In production, call Python orchestrator
	return nil
}
