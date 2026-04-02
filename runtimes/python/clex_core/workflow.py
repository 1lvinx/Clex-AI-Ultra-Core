"""Workflow Engine - Workflow orchestration for Python runtime.

This module provides a simple workflow engine for orchestrating
multi-step tasks across skills.
"""

import json
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Union


class StepStatus(Enum):
    """Workflow step status."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class WorkflowStep:
    """Workflow step."""
    
    id: str
    name: str
    action: str
    params: Dict[str, Any]
    next_step: Optional[str] = None
    condition: Optional[Callable[[Dict[str, Any]], bool]] = None
    status: StepStatus = StepStatus.PENDING
    outputs: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None


@dataclass
class Workflow:
    """Workflow definition."""
    
    id: str
    name: str
    description: Optional[str] = None
    steps: List[WorkflowStep] = field(default_factory=list)
    inputs: Dict[str, Any] = field(default_factory=dict)
    outputs: Dict[str, Any] = field(default_factory=dict)
    status: str = "pending"
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error: Optional[str] = None


class WorkflowEngine:
    """Workflow orchestration engine.
    
    This engine can:
    - Define workflows with multiple steps
    - Execute workflows step by step
    - Handle step dependencies
    - Return structured results
    
    Example:
        >>> engine = WorkflowEngine()
        >>> 
        >>> # Define a workflow
        >>> workflow = Workflow(
        ...     id="code-review",
        ...     name="Code Review Workflow",
        ...     steps=[
        ...         WorkflowStep(id=" analyze", action="code-analysis", params={"file": "src/index.js"}),
        ...         WorkflowStep(id="fix", action="ai-code-assistant", params={"task": "fix"}),
        ...     ]
        ... )
        >>> 
        >>> engine.register_workflow(workflow)
        >>> result = engine.execute_workflow("code-review", inputs={"file": "src/index.js"})
    """
    
    def __init__(self):
        """Initialize the workflow engine."""
        self._workflows: Dict[str, Workflow] = {}
        self._step_handlers: Dict[str, Callable[[Dict[str, Any]], Any]] = {}
    
    def register_workflow(self, workflow: Workflow) -> None:
        """Register a workflow.
        
        Args:
            workflow: Workflow to register
        """
        self._workflows[workflow.id] = workflow
    
    def register_step_handler(
        self,
        action: str,
        handler: Callable[[Dict[str, Any]], Any],
    ) -> None:
        """Register a handler for a step action.
        
        Args:
            action: Action name
            handler: Handler function that takes params and returns result
        """
        self._step_handlers[action] = handler
    
    def execute_workflow(
        self,
        workflow_id: str,
        inputs: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Execute a workflow.
        
        Args:
            workflow_id: Workflow ID
            inputs: Input parameters
        
        Returns:
            Workflow execution result
        """
        workflow = self._workflows.get(workflow_id)
        if workflow is None:
            return {"error": f"Workflow '{workflow_id}' not found"}
        
        workflow.status = "running"
        workflow.started_at = datetime.now()
        
        # Merge inputs
        if inputs:
            workflow.inputs.update(inputs)
        
        # Execute steps
        for step in workflow.steps:
            step.status = StepStatus.RUNNING
            
            try:
                # Call handler
                handler = self._step_handlers.get(step.action)
                if handler is None:
                    step.status = StepStatus.FAILED
                    step.error = f"Handler not found for action '{step.action}'"
                    continue
                
                result = handler(step.params)
                
                step.status = StepStatus.COMPLETED
                step.outputs = result
                
                # Update workflow outputs
                workflow.outputs.update(result)
                
            except Exception as e:
                step.status = StepStatus.FAILED
                step.error = str(e)
                workflow.status = "failed"
                workflow.error = str(e)
                workflow.completed_at = datetime.now()
                return self._workflow_result(workflow)
        
        workflow.status = "completed"
        workflow.completed_at = datetime.now()
        
        return self._workflow_result(workflow)
    
    def _workflow_result(self, workflow: Workflow) -> Dict[str, Any]:
        """Get workflow result dictionary."""
        return {
            "workflow_id": workflow.id,
            "name": workflow.name,
            "status": workflow.status,
            "inputs": workflow.inputs,
            "outputs": workflow.outputs,
            "started_at": workflow.started_at.isoformat() if workflow.started_at else None,
            "completed_at": workflow.completed_at.isoformat() if workflow.completed_at else None,
            "error": workflow.error,
            "steps": [
                {
                    "id": s.id,
                    "name": s.name,
                    "action": s.action,
                    "status": s.status.value,
                    "outputs": s.outputs,
                    "error": s.error,
                }
                for s in workflow.steps
            ],
        }
    
    def execute_workflow_step(
        self,
        workflow_id: str,
        step_id: str,
    ) -> Dict[str, Any]:
        """Execute a single workflow step.
        
        Args:
            workflow_id: Workflow ID
            step_id: Step ID
        
        Returns:
            Step execution result
        """
        workflow = self._workflows.get(workflow_id)
        if workflow is None:
            return {"error": f"Workflow '{workflow_id}' not found"}
        
        step = next((s for s in workflow.steps if s.id == step_id), None)
        if step is None:
            return {"error": f"Step '{step_id}' not found"}
        
        handler = self._step_handlers.get(step.action)
        if handler is None:
            return {
                "error": f"Handler not found for action '{step.action}'",
                "step_id": step_id,
            }
        
        try:
            result = handler(step.params)
            return {
                "success": True,
                "step_id": step_id,
                "result": result,
            }
        except Exception as e:
            return {
                "success": False,
                "step_id": step_id,
                "error": str(e),
            }
    
    def list_workflows(self) -> List[Workflow]:
        """List all registered workflows.
        
        Returns:
            List of workflows
        """
        return list(self._workflows.values())
    
    def get_workflow(self, workflow_id: str) -> Optional[Workflow]:
        """Get a workflow by ID.
        
        Args:
            workflow_id: Workflow ID
        
        Returns:
            Workflow or None if not found
        """
        return self._workflows.get(workflow_id)
    
    def from_dict(self, data: Dict[str, Any]) -> Workflow:
        """Create workflow from dictionary.
        
        Args:
            data: Workflow definition as dictionary
        
        Returns:
            Workflow object
        """
        steps = [
            WorkflowStep(
                id=s["id"],
                name=s["name"],
                action=s["action"],
                params=s.get("params", {}),
                next_step=s.get("next_step"),
            )
            for s in data.get("steps", [])
        ]
        
        return Workflow(
            id=data["id"],
            name=data["name"],
            description=data.get("description"),
            steps=steps,
            inputs=data.get("inputs", {}),
        )
