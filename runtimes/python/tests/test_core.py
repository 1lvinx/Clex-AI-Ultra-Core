"""Tests for Clex Core Python Runtime."""

import unittest


class TestImports(unittest.TestCase):
    """Test imports."""
    
    def test_import_core(self):
        """Test core import."""
        import clex_core
        self.assertTrue(hasattr(clex_core, 'WorkflowEngine'))
        self.assertTrue(hasattr(clex_core, 'TaskScheduler'))
        self.assertTrue(hasattr(clex_core, 'PermissionGate'))
    
    def test_import_workflow_engine(self):
        """Test WorkflowEngine import."""
        from clex_core import WorkflowEngine
        self.assertIsNotNone(WorkflowEngine)
    
    def test_import_task_scheduler(self):
        """Test TaskScheduler import."""
        from clex_core import TaskScheduler
        self.assertIsNotNone(TaskScheduler)
    
    def test_import_permission_gate(self):
        """Test PermissionGate import."""
        from clex_core import PermissionGate
        self.assertIsNotNone(PermissionGate)


class TestWorkflowEngine(unittest.TestCase):
    """Test WorkflowEngine."""
    
    def test_create_workflow_engine(self):
        """Test creating a WorkflowEngine."""
        from clex_core import WorkflowEngine
        engine = WorkflowEngine()
        self.assertIsNotNone(engine)


class TestTaskScheduler(unittest.TestCase):
    """Test TaskScheduler."""
    
    def test_create_task_scheduler(self):
        """Test creating a TaskScheduler."""
        from clex_core import TaskScheduler
        scheduler = TaskScheduler()
        self.assertIsNotNone(scheduler)
    
    def test_submit_task(self):
        """Test submitting a task."""
        from clex_core import TaskScheduler
        scheduler = TaskScheduler()
        
        task_id = scheduler.submit_task(
            task_type="test",
            inputs={"key": "value"},
            prompt="Test task",
        )
        
        self.assertIsNotNone(task_id)
        
        task = scheduler.get_task(task_id)
        self.assertIsNotNone(task)
        self.assertEqual(task.type, "test")


class TestPermissionGate(unittest.TestCase):
    """Test PermissionGate."""
    
    def test_create_permission_gate(self):
        """Test creating a PermissionGate."""
        from clex_core import PermissionGate
        gate = PermissionGate()
        self.assertIsNotNone(gate)
    
    def test_check_command_allowed(self):
        """Test checking an allowed command."""
        from clex_core import PermissionGate
        gate = PermissionGate()
        
        result = gate.check_command("ls -la")
        self.assertTrue(result["allowed"])
    
    def test_check_command_deny(self):
        """Test checking a denied command."""
        from clex_core import PermissionGate
        gate = PermissionGate()
        
        gate.add_rule(
            type_="bash",
            pattern="^rm",
            action="deny",
            priority=100,
        )
        
        result = gate.check_command("rm -rf /tmp")
        self.assertFalse(result["allowed"])


if __name__ == "__main__":
    unittest.main()
