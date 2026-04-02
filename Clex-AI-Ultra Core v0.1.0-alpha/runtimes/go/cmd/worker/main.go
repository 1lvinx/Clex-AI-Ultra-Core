package main

import (
	"context"
	"fmt"
	"log"
	
	"clex/internal/dispatcher"
	"clex/internal/worker"
)

func main() {
	fmt.Println("Clex-AI-Ultra Core Worker")
	
	ctx := context.Background()
	
	// Create worker pool
	pool := worker.NewWorkerPool(5)
	pool.AddWorker("worker-1")
	
	// Start dispatcher
	disp := dispatcher.NewDispatcher()
	
	pool.Process(ctx)
	
	// Process tasks
	for {
		task := disp.NextTask()
		if task == nil {
			break
		}
		log.Printf("Processing task: %s", task.ID)
	}
}
