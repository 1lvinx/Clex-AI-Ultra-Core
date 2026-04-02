package worker

import (
	"context"
	"fmt"
)

// Worker represents a single worker
type Worker struct {
	ID string
}

// WorkerPool manages a pool of workers
type WorkerPool struct {
	workers    []*Worker
	maxWorkers int
}

// NewWorkerPool creates a new worker pool
func NewWorkerPool(maxWorkers int) *WorkerPool {
	return &WorkerPool{
		workers:    make([]*Worker, 0),
		maxWorkers: maxWorkers,
	}
}

// AddWorker adds a worker to the pool
func (p *WorkerPool) AddWorker(id string) {
	if len(p.workers) < p.maxWorkers {
		p.workers = append(p.workers, &Worker{ID: id})
	}
}

// Process tasks from queue
func (p *WorkerPool) Process(ctx context.Context) {
	for _, worker := range p.workers {
		fmt.Printf("Worker %s processing\n", worker.ID)
	}
}
