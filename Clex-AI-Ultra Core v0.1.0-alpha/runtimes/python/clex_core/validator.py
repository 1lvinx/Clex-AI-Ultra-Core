"""Validator - Command validation utilities.

This module provides command validation using the Rust validator SDK.
"""

import subprocess
import json
from typing import Dict, Any


class CommandValidator:
    """Command validator using Rust SDK.
    
    This validator:
    - Validates Bash/PowerShell commands
    - Returns risk assessment
    - Provides expert advice
    
    Example:
        >>> validator = CommandValidator(rust_sdk_path="path/to/validator")
        >>> result = validator.validate("ls -la")
        >>> print(result["level"])
        "safe"
    """
    
    def __init__(self, rust_sdk_path: str = "rust_validator"):
        """Initialize the validator.
        
        Args:
            rust_sdk_path: Path to Rust validator executable
        """
        self._rust_sdk_path = rust_sdk_path
    
    def validate(self, command: str) -> Dict[str, Any]:
        """Validate a command.
        
        Args:
            command: Command to validate
        
        Returns:
            Validation result
        """
        try:
            result = subprocess.run(
                [self._rust_sdk_path, "validate", command],
                capture_output=True,
                text=True,
                timeout=5,
            )
            
            if result.returncode == 0:
                return json.loads(result.stdout)
            
            return {
                "level": "moderate",
                "score": 50,
                "needs_approval": True,
                "reasons": ["Validation failed"],
                "advice": "Please check the command manually",
            }
            
        except FileNotFoundError:
            # Fallback if Rust SDK not available
            return self._fallback_validate(command)
        
        except Exception as e:
            return {
                "level": "moderate",
                "score": 50,
                "needs_approval": True,
                "reasons": [str(e)],
                "advice": "Validation failed, please check manually",
            }
    
    def _fallback_validate(self, command: str) -> Dict[str, Any]:
        """Fallback validation if Rust SDK not available."""
        # Basic pattern matching
        dangerous_patterns = [
            (r"^rm\s+-rf", 75),
            (r"^dd\s+if=", 100),
            (r"^mkfs", 100),
        ]
        
        score = 0
        reasons = []
        
        for pattern, threat_score in dangerous_patterns:
            if pattern in command:
                score = max(score, threat_score)
                reasons.append(f"Matches dangerous pattern: {pattern}")
        
        if score >= 90:
            level = "critical"
            needs_approval = True
            advice = " ❌ 永远需要批准"
        elif score >= 60:
            level = "dangerous"
            needs_approval = True
            advice = " ❌ 需要批准"
        elif score >= 30:
            level = "moderate"
            needs_approval = True
            advice = "🟡 根据上下文"
        else:
            level = "safe"
            needs_approval = False
            advice = "✅ 可以安全执行"
        
        return {
            "level": level,
            "score": score,
            "needs_approval": needs_approval,
            "reasons": reasons,
            "advice": advice,
        }
