#!/usr/bin/env python3
"""CLI entry point for Python runtime."""

import sys
import json
from pathlib import Path

from clex_core import PermissionGate, TaskScheduler, WorkflowEngine


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python -m clex_core <command> [args...]")
        print("Commands:")
        print("  permission <action> [args...]  - Permission management")
        print("  task <action> [args...]        - Task management")
        print("  workflow <id> [inputs...]      - Execute workflow")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "permission":
        _handle_permission(sys.argv[2:])
    elif command == "task":
        _handle_task(sys.argv[2:])
    elif command == "workflow":
        _handle_workflow(sys.argv[2:])
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


def _handle_permission(args: list):
    """Handle permission commands."""
    gate = PermissionGate()
    
    if not args:
        print("Usage: permission <check|list|add|remove|evaluate> [args...]")
        return
    
    action = args[0]
    
    if action == "check":
        if len(args) < 2:
            print("Usage: permission check <command>")
            return
        command = args[1]
        result = gate.check_command(command)
        if result["allowed"]:
            print(f"✅ 允许")
        else:
            print(f"❌ 拒绝")
        print(f"原因: {result['reason']}")
    
    elif action == "evaluate":
        if len(args) < 2:
            print("Usage: permission evaluate <command>")
            return
        command = args[1]
        result = gate.check_command(command)
        print(json.dumps(result, indent=2))
    
    else:
        print(f"Unknown action: {action}")


def _handle_task(args: list):
    """Handle task commands."""
    scheduler = TaskScheduler()
    
    if not args:
        print("Usage: task <submit|status|result|cancel> [args...]")
        return
    
    action = args[0]
    
    if action == "submit":
        if len(args) < 3:
            print("Usage: task submit <type> <prompt> [inputs...]")
            return
        task_type = args[1]
        prompt = args[2]
        
        # Parse inputs as JSON
        inputs = {}
        if len(args) > 3:
            try:
                inputs = json.loads(args[3])
            except json.JSONDecodeError:
                print("Error: Invalid JSON inputs")
                return
        
        task_id = scheduler.submit_task(task_type, inputs, prompt)
        print(f"Task submitted: {task_id}")
    
    else:
        print(f"Unknown action: {action}")


def _handle_workflow(args: list):
    """Handle workflow commands."""
    if not args:
        print("Usage: workflow <id> [inputs...]")
        return
    
    workflow_id = args[0]
    
    # Parse inputs as JSON
    inputs = {}
    if len(args) > 1:
        try:
            inputs = json.loads(args[1])
        except json.JSONDecodeError:
            print("Error: Invalid JSON inputs")
            return
    
    engine = WorkflowEngine()
    
    # Example: execute a simple workflow
    result = engine.execute_workflow(workflow_id, inputs)
    
    if "error" in result:
        print(f"Error: {result['error']}")
        return
    
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
