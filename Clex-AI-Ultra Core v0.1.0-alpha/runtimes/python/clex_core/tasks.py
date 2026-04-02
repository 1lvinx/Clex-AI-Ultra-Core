"""Task Scheduler - Task execution and scheduling for Python runtime.

This module provides a simple task scheduler that can execute tasks
and track their progress.
"""

import json
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional


class TaskStatus(Enum):
    """Task status."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class TaskPayload:
    """Task payload structure."""
    
    id: str
    type: str
    prompt: str
    inputs: Dict[str, Any]
    outputs: Dict[str, Any] = field(default_factory=dict)
    status: TaskStatus = TaskStatus.PENDING
    progress: int = 0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "type": self.type,
            "prompt": self.prompt,
            "inputs": self.inputs,
            "outputs": self.outputs,
            "status": self.status.value,
            "progress": self.progress,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "error": self.error,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TaskPayload":
        """Create from dictionary."""
        return cls(
            id=data["id"],
            type=data["type"],
            prompt=data["prompt"],
            inputs=data["inputs"],
            outputs=data.get("outputs", {}),
            status=TaskStatus(data.get("status", "pending")),
            progress=data.get("progress", 0),
            started_at=datetime.fromisoformat(data["started_at"]) if data.get("started_at") else None,
            completed_at=datetime.fromisoformat(data["completed_at"]) if data.get("completed_at") else None,
            error=data.get("error"),
        )


class TaskScheduler:
    """Simple task scheduler for Python runtime.
    
    This scheduler can:
    - Submit tasks for execution
    - Track task progress
    - Retrieve task results
    - Cancel running tasks
    
    Example:
        >>> scheduler = TaskScheduler()
        >>> task_id = scheduler.submit_task(
        ...     "code-analysis",
        ...     {"file": "src/index.js"},
        ...     prompt="Analyze this file for issues"
        ... )
        >>> result = scheduler.get_task_result(task_id)
    """
    
    def __init__(self, tasks_dir: Optional[str] = None):
        """Initialize the task scheduler.
        
        Args:
            tasks_dir: Optional directory to persist tasks
        """
        self._tasks: Dict[str, TaskPayload] = {}
        self._lock = threading.Lock()
        self._tasks_dir = Path(tasks_dir) if tasks_dir else None
        
        if self._tasks_dir:
            self._tasks_dir.mkdir(parents=True, exist_ok=True)
    
    def submit_task(
        self,
        task_type: str,
        inputs: Dict[str, Any],
        prompt: str,
    ) -> str:
        """Submit a new task for execution.
        
        Args:
            task_type: Type of task (e.g., 'code-analysis', 'workflow')
            inputs: Task inputs
            prompt: Task prompt
        
        Returns:
            str: Task ID
        """
        import uuid
        
        task_id = str(uuid.uuid4())
        
        task = TaskPayload(
            id=task_id,
            type=task_type,
            prompt=prompt,
            inputs=inputs,
        )
        
        with self._lock:
            self._tasks[task_id] = task
        
        self._persist_task(task)
        
        return task_id
    
    def get_task(self, task_id: str) -> Optional[TaskPayload]:
        """Get a task by ID.
        
        Args:
            task_id: Task ID
        
        Returns:
            TaskPayload or None if not found
        """
        with self._lock:
            return self._tasks.get(task_id)
    
    def get_task_result(self, task_id: str, timeout: float = 30.0) -> Dict[str, Any]:
        """Get task result with optional timeout.
        
        Args:
            task_id: Task ID
            timeout: Wait timeout in seconds
        
        Returns:
            Task result dictionary
        """
        start_time = time.time()
        
        while True:
            with self._lock:
                task = self._tasks.get(task_id)
            
            if task is None:
                return {"error": "Task not found"}
            
            if task.status == TaskStatus.COMPLETED:
                return task.to_dict()
            
            if task.status in (TaskStatus.FAILED, TaskStatus.CANCELLED):
                return task.to_dict()
            
            if time.time() - start_time > timeout:
                return {"error": "Timeout waiting for task"}
            
            time.sleep(0.1)
    
    def cancel_task(self, task_id: str) -> bool:
        """Cancel a running task.
        
        Args:
            task_id: Task ID
        
        Returns:
            True if task was cancelled, False if not found
        """
        with self._lock:
            task = self._tasks.get(task_id)
            if task is None:
                return False
            
            task.status = TaskStatus.CANCELLED
            task.completed_at = datetime.now()
            
            self._persist_task(task)
            return True
    
    def update_task_progress(
        self,
        task_id: str,
        progress: int,
        outputs: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """Update task progress.
        
        Args:
            task_id: Task ID
            progress: Progress percentage (0-100)
            outputs: Optional task outputs
        
        Returns:
            True if task was updated, False if not found
        """
        with self._lock:
            task = self._tasks.get(task_id)
            if task is None:
                return False
            
            task.progress = progress
            if outputs:
                task.outputs.update(outputs)
            
            return True
    
    def complete_task(
        self,
        task_id: str,
        outputs: Dict[str, Any],
    ) -> bool:
        """Mark task as completed.
        
        Args:
            task_id: Task ID
            outputs: Task outputs
        
        Returns:
            True if task was completed, False if not found
        """
        with self._lock:
            task = self._tasks.get(task_id)
            if task is None:
                return False
            
            task.status = TaskStatus.COMPLETED
            task.outputs.update(outputs)
            task.completed_at = datetime.now()
            
            self._persist_task(task)
            return True
    
    def fail_task(
        self,
        task_id: str,
        error: str,
    ) -> bool:
        """Mark task as failed.
        
        Args:
            task_id: Task ID
            error: Error message
        
        Returns:
            True if task was marked as failed, False if not found
        """
        with self._lock:
            task = self._tasks.get(task_id)
            if task is None:
                return False
            
            task.status = TaskStatus.FAILED
            task.error = error
            task.completed_at = datetime.now()
            
            self._persist_task(task)
            return True
    
    def list_tasks(self, status: Optional[TaskStatus] = None) -> List[TaskPayload]:
        """List tasks, optionally filtered by status.
        
        Args:
            status: Optional status filter
        
        Returns:
            List of tasks
        """
        with self._lock:
            tasks = list(self._tasks.values())
        
        if status:
            tasks = [t for t in tasks if t.status == status]
        
        return tasks
    
    def _persist_task(self, task: TaskPayload) -> None:
        """Persist task to disk if tasks_dir is set."""
        if not self._tasks_dir:
            return
        
        filepath = self._tasks_dir / f"{task.id}.json"
        filepath.write_text(json.dumps(task.to_dict(), indent=2))
