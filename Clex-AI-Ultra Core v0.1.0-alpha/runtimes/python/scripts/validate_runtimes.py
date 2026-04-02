#!/usr/bin/env python3
"""Validate Python runtime."""

import sys
from pathlib import Path


def validate_runtime():
    """Validate Python runtime installation."""
    errors = []
    
    # Check Python version
    import sys
    if sys.version_info < (3, 8):
        errors.append("Python 3.8+ required")
    
    # Check required files
    required_files = [
        "clex_core/__init__.py",
        "clex_core/workflow.py",
        "clex_core/tasks.py",
        "clex_core/permissions.py",
        "clex_core/manifest.py",
        "examples/run_workflow.py",
    ]
    
    for file in required_files:
        if not Path(file).exists():
            errors.append(f"Missing file: {file}")
    
    # Try imports
    try:
        import clex_core
    except ImportError as e:
        errors.append(f"Failed to import clex_core: {e}")
    
    try:
        from clex_core import WorkflowEngine
    except ImportError as e:
        errors.append(f"Failed to import WorkflowEngine: {e}")
    
    try:
        from clex_core import TaskScheduler
    except ImportError as e:
        errors.append(f"Failed to import TaskScheduler: {e}")
    
    try:
        from clex_core import PermissionGate
    except ImportError as e:
        errors.append(f"Failed to import PermissionGate: {e}")
    
    return errors


if __name__ == "__main__":
    errors = validate_runtime()
    
    if errors:
        print("Validation failed:")
        for error in errors:
            print(f"  ❌ {error}")
        sys.exit(1)
    
    print("✅ Python runtime validation passed!")
    print()
    print("Next steps:")
    print("  1. Run 'python -m clex_core --help' for CLI help")
    print("  2. Run 'python examples/run_workflow.py' for example")
    print("  3. See 'docs/python-runtime.md' for more info")
