# clex-core Python Runtime

Python runtime for Clex-AI-Ultra Core - Workflow orchestration, task execution, and local validation tools.

## Installation

```bash
cd runtimes/python
pip install -e .
```

## Usage

```python
from clex_core import WorkflowEngine, TaskScheduler, PermissionGate

# Workflow orchestration
engine = WorkflowEngine()
engine.register_workflow("pr-review", [...])
engine.execute_workflow("pr-review", inputs={"pr": 123})

# Task scheduling
scheduler = TaskScheduler()
task_id = scheduler.submit_task("code-analysis", {"file": "src/index.js"})
result = scheduler.get_task_result(task_id)

# Permission checking
gate = PermissionGate()
gate.check_command("ls -la")  # Returns: {allowed: True, reason: "..."}
```

## Project Structure

- `clex_core/` - Core library
  - `workflow.py` - Workflow orchestration engine
  - `tasks.py` - Task scheduler
  - `permissions.py` - Permission gate
  - `manifest.py` - Skill manifest parser
  - `validator.py` - Command validator (calls Rust SDK)
  - `sdkclient.py` - Cross-language SDK client
  - `mcpclient.py` - MCP protocol client
- `examples/` - Usage examples
- `tests/` - Unit tests

## License

MIT License
