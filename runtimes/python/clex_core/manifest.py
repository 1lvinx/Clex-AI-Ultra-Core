"""Skill Manifest Parser - Parse skill manifests from SKILL.md files.

This module provides classes for parsing skill manifests from SKILL.md files
and validating them against the JSON schema.
"""

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class SkillManifest:
    """Represents a parsed skill manifest."""
    
    name: str
    version: str
    description: Dict[str, str]
    capability_group: str
    commands: List[Dict[str, Any]]
    runtimes: Dict[str, Any] = field(default_factory=dict)
    inputs: Optional[Dict[str, Any]] = None
    outputs: Optional[Dict[str, Any]] = None
    requirements: List[str] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "name": self.name,
            "version": self.version,
            "description": self.description,
            "capability_group": self.capability_group,
            "commands": self.commands,
            "runtimes": self.runtimes,
            "inputs": self.inputs,
            "outputs": self.outputs,
            "requirements": self.requirements,
            "dependencies": self.dependencies,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SkillManifest":
        """Create from dictionary."""
        return cls(
            name=data["name"],
            version=data["version"],
            description=data["description"],
            capability_group=data["capability_group"],
            commands=data["commands"],
            runtimes=data.get("runtimes", {}),
            inputs=data.get("inputs"),
            outputs=data.get("outputs"),
            requirements=data.get("requirements", []),
            dependencies=data.get("dependencies", []),
        )


def load_skill_manifest(skill_path: str) -> SkillManifest:
    """Load a skill manifest from its directory.
    
    Args:
        skill_path: Path to the skill directory (e.g., 'skills/ai-code-assistant')
    
    Returns:
        SkillManifest: Parsed skill manifest
        
    Example:
        >>> manifest = load_skill_manifest('skills/ai-code-assistant')
        >>> print(manifest.name)
        'ai-code-assistant'
    """
    skill_dir = Path(skill_path)
    skill_md = skill_dir / "SKILL.md"
    
    if not skill_md.exists():
        raise FileNotFoundError(f"SKILL.md not found at {skill_md}")
    
    content = skill_md.read_text(encoding="utf-8")
    
    # Extract metadata from SKILL.md comments
    # Format: # <key>: <value>
    metadata = {}
    for line in content.split("\n"):
        if line.startswith("# "):
            match = re.match(r"#\s*(\w+):\s*(.+)", line)
            if match:
                metadata[match.group(1)] = match.group(2)
    
    # Extract commands
    commands = []
    in_commands = False
    for line in content.split("\n"):
        if line.startswith("## 命令") or line.startswith("## Commands"):
            in_commands = True
            continue
        if in_commands and line.startswith("## "):
            in_commands = False
            continue
        if in_commands and line.strip().startswith("/"):
            # Parse command line
            parts = line.strip().split(None, 1)
            if len(parts) >= 1:
                commands.append({
                    "name": parts[0],
                    "description": parts[1] if len(parts) > 1 else "",
                })
    
    return SkillManifest(
        name=skill_dir.name,
        version=metadata.get("version", "1.0.0"),
        description={
            "en": metadata.get("description", ""),
            "zh": metadata.get("描述", ""),
        },
        capability_group=_determine_capability_group(skill_dir.name),
        commands=commands,
    )


def _determine_capability_group(skill_name: str) -> str:
    """Determine the capability group for a skill."""
    group_mapping = {
        # G1: Command Processing
        "cli-commands": "G1",
        "command-classifier": "G1",
        "permission-engine": "G1",
        "cli-integration": "G1",
        # G2: AI Capability
        "ai-code-assistant": "G2",
        "code-analysis": "G2",
        "ai-workflows": "G2",
        "test-framework": "G2",
        # G3: Workflow Orchestration
        "task-dispatcher": "G3",
        "ai-workflows": "G3",
        "agent-teams": "G3",
        "background-tasks": "G3",
        # G4: DevOps Tools
        "git-operations": "G4",
        "test-framework": "G4",
        "dev-tools": "G4",
        # G5: Protocol Integration
        "mcp-integration": "G5",
        "agent-communication": "G5",
        # G6: System Infrastructure
        "permission-engine": "G6",
        "test-framework": "G6",
    }
    
    return group_mapping.get(skill_name, "G6")


def validate_manifest(manifest: SkillManifest) -> bool:
    """Validate a skill manifest against the schema.
    
    Args:
        manifest: SkillManifest to validate
    
    Returns:
        bool: True if valid
    """
    # Basic validation
    if not manifest.name:
        raise ValueError("Skill name is required")
    
    if not manifest.version:
        raise ValueError("Version is required")
    
    if not re.match(r"^\d+\.\d+\.\d+$", manifest.version):
        raise ValueError(f"Invalid version format: {manifest.version}")
    
    # Validate commands
    for cmd in manifest.commands:
        if "name" not in cmd:
            raise ValueError("Command must have a name")
    
    return True


def load_all_skill_manifests(skills_dir: str) -> List[SkillManifest]:
    """Load all skill manifests from a directory.
    
    Args:
        skills_dir: Path to skills directory
    
    Returns:
        List[SkillManifest]: List of all skill manifests
    """
    skill_paths = Path(skills_dir).glob("*/SKILL.md")
    
    manifests = []
    for skill_md in skill_paths:
        try:
            manifest = load_skill_manifest(str(skill_md.parent))
            manifests.append(manifest)
        except Exception as e:
            print(f"Warning: Failed to load {skill_md.parent}: {e}")
    
    return manifests
