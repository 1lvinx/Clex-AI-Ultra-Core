"""Example: Run a task."""
from clex_core import TaskScheduler


def main():
    """Run task example."""
    print("=== Clex Python Runtime - Task Example ===\n")
    
    scheduler = TaskScheduler()
    
    # Submit a task
    task_id = scheduler.submit_task(
        task_type="workflow",
        inputs={"name": "code-review"},
        prompt="Review the code for issues",
    )
    
    print(f"Task submitted: {task_id}")
    
    # Get task status
    task = scheduler.get_task(task_id)
    if task:
        print(f"Task status: {task.status.value}")
        print(f"Task inputs: {task.inputs}")
    
    # Get task result
    result = scheduler.get_task_result(task_id, timeout=30)
    print(f"Task result: {result}")


if __name__ == "__main__":
    main()
