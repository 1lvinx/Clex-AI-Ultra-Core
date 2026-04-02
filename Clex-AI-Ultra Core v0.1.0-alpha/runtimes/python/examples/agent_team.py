"""Example: Operate an agent team."""

from clex_core import TaskScheduler


def main():
    """Agent team example."""
    print("=== Clex Python Runtime - Agent Team Example ===\n")
    
    scheduler = TaskScheduler()
    
    # Submit tasks to the team
    tasks = [
        {"type": "code-analysis", "prompt": "Analyze utils.js"},
        {"type": "test-generation", "prompt": "Generate tests for utils.js"},
        {"type": "code-review", "prompt": "Review the PR"},
    ]
    
    for task in tasks:
        task_id = scheduler.submit_task(
            task_type=task["type"],
            inputs={},
            prompt=task["prompt"],
        )
        print(f"Task submitted: {task_id}")
    
    # List tasks
    all_tasks = scheduler.list_tasks()
    print(f"\nTotal tasks: {len(all_tasks)}")
    
    for task in all_tasks:
        print(f"  - {task.id} ({task.status.value}): {task.prompt[:50]}...")


if __name__ == "__main__":
    main()
