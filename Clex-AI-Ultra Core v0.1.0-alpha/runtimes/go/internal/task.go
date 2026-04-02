use std::collections::HashMap;

/// Task represents an individual task to be executed
#[derive(Debug, Clone)]
pub struct Task {
    pub id: String,
    pub task_type: String,
    pub prompt: String,
    pub inputs: HashMap<String, String>,
    pub status: TaskStatus,
}

/// TaskStatus represents the status of a task
#[derive(Debug, Clone, PartialEq)]
pub enum TaskStatus {
    Pending,
    Running,
    Completed,
    Failed,
}

/// WorkerPool manages a pool of workers
pub struct WorkerPool {
    pub max_workers: usize,
    pub tasks: Vec<Task>,
}

impl WorkerPool {
    pub fn new(max_workers: usize) -> Self {
        WorkerPool {
            max_workers,
            tasks: vec![],
        }
    }
    
    pub fn add_task(&mut self, task: Task) {
        self.tasks.push(task);
    }
    
    pub fn process_queue(&mut self) {
        for task in &mut self.tasks {
            if task.status == TaskStatus::Pending {
                task.status = TaskStatus::Running;
                println!("Processing task: {}", task.id);
                task.status = TaskStatus::Completed;
            }
        }
    }
}
