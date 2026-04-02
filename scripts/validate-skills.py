#!/usr/bin/env python3
"""
Clex-AI-Ultra Skill Validator
Scans skills directory and checks for required files and potential issues
"""

import os
import sys
import re
from pathlib import Path

SKILLS_DIR = "skills"
REQUIRED_FILES = ["SKILL.md"]
HIGH_RISK_KEYWORDS = [
    "leak", "leaked", "泄露", "source-analysis", 
    "reverse engineering", "proprietary", "Anthropic",
    "claude internal", "官方泄露", "内部代码", "dump",
    "source collection"
]

def check_skill(skill_path: Path) -> list:
    """Check a single skill for required files and issues"""
    issues = []
    skill_name = skill_path.name
    
    # Check required files
    for req_file in REQUIRED_FILES:
        file_path = skill_path / req_file
        if not file_path.exists():
            issues.append(f"❌ {skill_name}: Missing {req_file}")
        else:
            # Check file contents for high-risk keywords
            try:
                content = file_path.read_text(encoding='utf-8')
                for keyword in HIGH_RISK_KEYWORDS:
                    if keyword.lower() in content.lower():
                        issues.append(f"⚠️ {skill_name}: Contains high-risk keyword '{keyword}' in {req_file}")
            except Exception as e:
                issues.append(f"⚠️ {skill_name}: Could not read {req_file} - {e}")
    
    # Check for origin.json and _meta.json (should be excluded from public repo)
    for file in skill_path.rglob("*"):
        if file.name in ["origin.json", "_meta.json"]:
            issues.append(f"⚠️ {skill_name}: Found {file.name} at {file.relative_to(skill_path)}")
    
    return issues

def main():
    skills_dir = Path(SKILLS_DIR)
    
    if not skills_dir.exists():
        print(f"Error: Skills directory '{SKILLS_DIR}' not found!")
        sys.exit(1)
    
    print("=" * 60)
    print("Clex-AI-Ultra Skill Validator")
    print("=" * 60)
    
    all_issues = []
    valid_skills = []
    
    for skill_path in sorted(skills_dir.iterdir()):
        if skill_path.is_dir():
            issues = check_skill(skill_path)
            if issues:
                all_issues.extend(issues)
            else:
                valid_skills.append(skill_path.name)
    
    # Summary
    print(f"\n{len(valid_skills)} skills passed validation ✅")
    for skill in valid_skills:
        print(f"  ✅ {skill}")
    
    if all_issues:
        print(f"\n{len(all_issues)} issues found ⚠️")
        for issue in all_issues:
            print(f"  {issue}")
        
        # Filter high-risk issues
        high_risk = [i for i in all_issues if "high-risk keyword" in i]
        if high_risk:
            print(f"\n{len(high_risk)} skills contain high-risk keywords!")
            for hr in high_risk:
                print(f"  ❌ {hr}")
    
    # Exit with error if high-risk keywords found
    if any("high-risk keyword" in issue for issue in all_issues):
        print("\n⚠️  Skills with high-risk keywords need manual review!")
        sys.exit(1)
    
    print("\n✅ Validation complete!")
    
    # List all skills for reference
    print("\nSkills in directory:")
    for skill_path in sorted(skills_dir.iterdir()):
        if skill_path.is_dir():
            print(f"  - {skill_path.name}")

if __name__ == "__main__":
    main()
