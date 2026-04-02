"""Permission Engine - Permission checking for commands.

This module provides permission checking logic for commands,
compatible with the Rule Engine from permission-engine skill.
"""

import json
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Set


@dataclass
class PermissionRule:
    """Permission rule."""
    
    id: str
    type: str
    pattern: str
    action: str
    priority: int
    enabled: bool = True
    description: Optional[str] = None
    
    def matches(self, command: str) -> bool:
        """Check if rule matches a command."""
        if not self.enabled:
            return False
        
        try:
            return bool(re.search(self.pattern, command))
        except re.error:
            return False


class PermissionEngine:
    """Permission engine for command checking.
    
    This engine:
    - Loads permission rules from JSON
    - Evaluates commands against rules
    - Determines if commands should be allowed
    
    Example:
        >>> engine = PermissionEngine()
        >>> engine.load_rules("rules.json")
        >>> result = engine.evaluate("ls -la")
        >>> print(result.allowed)
        True
    """
    
    def __init__(self):
        """Initialize the permission engine."""
        self._rules: List[PermissionRule] = []
        self._rule_id_counter = 0
    
    def add_rule(
        self,
        type_: str,
        pattern: str,
        action: str,
        description: Optional[str] = None,
        priority: int = 10,
        enabled: bool = True,
    ) -> PermissionRule:
        """Add a new permission rule.
        
        Args:
            type_: Rule type (bash, powershell, file, network, agent)
            pattern: Regex pattern to match
            action: Action (allow, deny)
            description: Optional description
            priority: Rule priority (higher = checked first)
            enabled: Whether rule is enabled
        
        Returns:
            PermissionRule: Created rule
        """
        self._rule_id_counter += 1
        rule_id = f"rule-{self._rule_id_counter:03d}"
        
        rule = PermissionRule(
            id=rule_id,
            type=type_,
            pattern=pattern,
            action=action,
            priority=priority,
            enabled=enabled,
            description=description,
        )
        
        self._rules.append(rule)
        self._rules.sort(key=lambda r: r.priority, reverse=True)
        
        return rule
    
    def load_rules(self, filepath: str) -> int:
        """Load rules from a JSON file.
        
        Args:
            filepath: Path to rules JSON file
        
        Returns:
            int: Number of rules loaded
        """
        with open(filepath, "r", encoding="utf-8") as f:
            rules_data = json.load(f)
        
        count = 0
        for rule_data in rules_data:
            self.add_rule(
                type_=rule_data["type"],
                pattern=rule_data["pattern"],
                action=rule_data["action"],
                description=rule_data.get("description"),
                priority=rule_data.get("priority", 10),
                enabled=rule_data.get("enabled", True),
            )
            count += 1
        
        return count
    
    def evaluate(self, command: str) -> Dict[str, Any]:
        """Evaluate a command against rules.
        
        Args:
            command: Command to evaluate
        
        Returns:
            Dict[str, Any]: Evaluation result
        """
        # Check rules in priority order
        for rule in self._rules:
            if rule.matches(command):
                return {
                    "allowed": rule.action == "allow",
                    "rule_id": rule.id,
                    "reason": rule.description or f"Matched rule {rule.id}",
                    "mode": "auto",
                    "matched_rule_count": 1,
                }
        
        # Default: allow if no rules match
        return {
            "allowed": True,
            "rule_id": None,
            "reason": "No rules matched, default allow",
            "mode": "auto",
            "matched_rule_count": 0,
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "rules": [
                {
                    "id": r.id,
                    "type": r.type,
                    "pattern": r.pattern,
                    "action": r.action,
                    "priority": r.priority,
                    "enabled": r.enabled,
                    "description": r.description,
                }
                for r in self._rules
            ]
        }
    
    def save_rules(self, filepath: str) -> None:
        """Save rules to a JSON file.
        
        Args:
            filepath: Path to save rules JSON file
        """
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(self.to_dict()["rules"], f, indent=2)


class PermissionGate:
    """Permission gate for command execution.
    
    This gate wraps the permission engine and provides
    a simple interface for checking commands.
    
    Example:
        >>> gate = PermissionGate()
        >>> gate.load_rules("rules.json")
        >>> result = gate.check_command("rm -rf /tmp")
        >>> if result["allowed"]:
        ...     subprocess.run("rm -rf /tmp", shell=True)
        >>> else:
        ...     print(f"Permission denied: {result['reason']}")
    """
    
    def __init__(self):
        """Initialize the permission gate."""
        self._engine = PermissionEngine()
    
    def add_rule(
        self,
        type_: str,
        pattern: str,
        action: str,
        description: Optional[str] = None,
        priority: int = 10,
    ) -> None:
        """Add a permission rule.
        
        Args:
            type_: Rule type (bash, powershell, file, network, agent)
            pattern: Regex pattern
            action: Action (allow, deny)
            description: Optional description
            priority: Rule priority
        """
        self._engine.add_rule(
            type_=type_,
            pattern=pattern,
            action=action,
            description=description,
            priority=priority,
        )
    
    def load_rules(self, filepath: str) -> None:
        """Load rules from JSON file.
        
        Args:
            filepath: Path to rules JSON file
        """
        self._engine.load_rules(filepath)
    
    def check_command(self, command: str) -> Dict[str, Any]:
        """Check if a command is allowed.
        
        Args:
            command: Command to check
        
        Returns:
            Dict with 'allowed' and 'reason' keys
        """
        result = self._engine.evaluate(command)
        return {
            "allowed": result["allowed"],
            "reason": result["reason"],
            "mode": result["mode"],
        }
