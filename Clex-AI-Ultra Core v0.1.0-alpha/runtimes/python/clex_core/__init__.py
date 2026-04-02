"""Clex Core - Python Runtime for Clex-AI-Ultra Core

A polyglot engineering core supporting Python, Node.js, Go, and Rust for AI-assisted development.

Features:
- Workflow orchestration
- Task execution and scheduling
- Permission checking
- Skill manifest parsing
- Command validation

Usage:
    from clex_core import WorkflowEngine, TaskScheduler, PermissionGate

    engine = WorkflowEngine()
    scheduler = TaskScheduler()
    gate = PermissionGate()
"""

__version__ = "1.0.0"

from clex_core.workflow import WorkflowEngine
from clex_core.tasks import TaskScheduler
from clex_core.permissions import PermissionGate
from clex_core.manifest import SkillManifest, load_skill_manifest
from clex_core.validator import CommandValidator

__all__ = [
    "WorkflowEngine",
    "TaskScheduler",
    "PermissionGate",
    "SkillManifest",
    "load_skill_manifest",
    "CommandValidator",
]
