"""Example: Run a workflow."""
from pathlib import Path

from clex_core import WorkflowEngine, TaskScheduler, PermissionGate


def main():
    """Run workflow example."""
    print("=== Clex Python Runtime - Workflow Example ===\n")
    
    # Initialize components
    engine = WorkflowEngine()
    scheduler = TaskScheduler()
    gate = PermissionGate()
    
    # Example 1: Permission check
    print("1. Permission Check")
    print("-" * 50)
    
    command = "ls -la"
    result = gate.check_command(command)
    
    if result["allowed"]:
        print(f"✅ Command '{command}' is allowed")
        print(f"   Reason: {result['reason']}")
    else:
        print(f"❌ Command '{command}' is denied")
        print(f"   Reason: {result['reason']}")
    
    print()
    
    # Example 2: Task submission
    print("2. Task Submission")
    print("-" * 50)
    
    task_id = scheduler.submit_task(
        task_type="code-analysis",
        inputs={"file": "src/index.js"},
        prompt="Analyze this file for issues",
    )
    
    print(f"Task submitted: {task_id}")
    
    # Get task result
    result = scheduler.get_task_result(task_id, timeout=5)
    print(f"Task status: {result.get('status')}")
    
    print()
    
    # Example 3: Workflow execution
    print("3. Workflow Execution")
    print("-" * 50)
    
    # Note: This requires a registered workflow
    # For demo, we'll just show the structure
    
    workflow_id = "pr-review"
    result = engine.execute_workflow(workflow_id, {"pr": 123})
    
    if "error" in result:
        print(f"Workflow execution: {result['error']}")
    else:
        print(f"Workflow '{workflow_id}' completed")
        print(f"Status: {result['status']}")
        print(f"Steps: {len(result['steps'])}")
    
    print()
    print("=== Example Complete ===")


if __name__ == "__main__":
    main()
