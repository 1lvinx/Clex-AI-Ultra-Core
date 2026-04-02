# Python Runtime / Python 运行时

Python runtime for Clex-AI-Ultra Core - **Workflow orchestration**, **task execution glue**, and **local validation tools**.

## Why Python? / 为什么用 Python？

- ✅ **Best for workflow orchestration** - Simple syntax, rich ecosystem
- ✅ **Rapid prototyping** - Write and test in minutes
- ✅ **Automation glue** - Perfect for connecting different components
- ✅ **Testing infrastructure** - pytest, unittest, coverage
- ✅ **Standard library** - No heavy dependencies needed

## Quick Install / 快速安装

```bash
cd runtimes/python

# Method 1: Local install
pip install -e .

# Method 2: With tests
pip install -e . -r requirements-dev.txt
pytest
```

## Usage / 使用

### 1. Workflow Orchestration / 工作流编排

```python
from clex_core import WorkflowEngine

engine = WorkflowEngine()

# Register a workflow
from clex_core import Workflow, WorkflowStep

workflow = Workflow(
    id="pr-review",
    name="PR Review Workflow",
    steps=[
        WorkflowStep(
            id="1",
            name="Analyze PR",
            action="code-analysis",
            params={"file": "src/index.js"},
        ),
        WorkflowStep(
            id="2",
            name="Generate Tests",
            action="test-framework",
            params={"file": "src/index.js"},
        ),
    ]
)

engine.register_workflow(workflow)

# Execute workflow
result = engine.execute_workflow("pr-review", {"pr": 123})
```

### 2. Task Scheduling / 任务调度

```python
from clex_core import TaskScheduler

scheduler = TaskScheduler()

# Submit a task
task_id = scheduler.submit_task(
    task_type="code-analysis",
    inputs={"file": "src/index.js"},
    prompt="Analyze this file for issues"
)

# Get result
result = scheduler.get_task_result(task_id, timeout=30)
```

### 3. Permission Checking / 权限检查

```python
from clex_core import PermissionGate

gate = PermissionGate()

# Add rules
gate.add_rule(
    type_="bash",
    pattern="^rm",
    action="deny",
    priority=100,
)

# Check command
result = gate.check_command("rm -rf /tmp")

if result["allowed"]:
    print("✅ Allowed")
else:
    print(f"❌ Denied: {result['reason']}")
```

### 4. Command Validation / 命令验证

```python
from clex_core import CommandValidator

validator = CommandValidator()

result = validator.validate("ls -la")
print(f"Level: {result['level']}")  # safe
print(f"Score: {result['score']}")  # 5
```

## CLI Usage / CLI 使用

```bash
# Check permission
python -m clex_core permission check "ls -la"

# Submit task
python -m clex_core task submit "code-analysis" "Analyze this file" '{"file": "index.js"}'
```

## Virtual Environment / 虚拟环境

```bash
# Create venv
python -m venv venv

# Activate
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Install
pip install -e .
```

## Project Structure / 项目结构

```
runtimes/python/
├── clex_core/              # Core library
│   ├── __init__.py
│   ├── workflow.py        # Workflow orchestration
│   ├── tasks.py           # Task scheduling
│   ├── permissions.py     # Permission checking
│   ├── manifest.py        # Skill manifest parser
│   ├── validator.py       # Command validation
│   ├── sdkclient.py       # Cross-language SDK
│   ├── mcpclient.py       # MCP protocol client
│   └── cli.py             # CLI entry point
├── examples/               # Usage examples
│   ├── run_workflow.py
│   ├── run_task.py
│   ├── validate_command.py
│   └── agent_team.py
├── tests/                  # Unit tests
│   └── test_core.py
└── scripts/
    ├── install.sh
    └── validate_runtimes.py
```

## Integration / 集成

### With Other Runtimes / 与其他运行时集成

```python
from clex_core.sdkclient import SkillClient

client = SkillClient()

# Call Node.js CLI
result = client.call_skill("permission", "evaluate", {"command": "ls -la"})

# Call Go worker (gRPC)
# result = client.call_go_worker("task", {"type": "workflow"})

# Call Rust validator (FFI)
# result = client.call_rust_validator("ls -la")
```

### With Existing Skills / 与现有技能集成

```python
from clex_core.manifest import load_skill_manifest

# Load skill manifest from existing skills directory
manifest = load_skill_manifest("../../../skills/ai-code-assistant")

# Get commands
for cmd in manifest.commands:
    print(f"- {cmd['name']}: {cmd['description']}")
```

## Testing / 测试

```bash
# Run tests
pytest

# With coverage
pytest --coverage

# Type checking
mypy clex_core/

# Linting
ruff check clex_core/
```

## License / 许可证

MIT License
