#!/usr/bin/env python3
"""Clex-AI-Ultra Core - Unified Validation Script"""

import sys
import json
from pathlib import Path


def validate_specs():
    """Validate JSON schemas."""
    print("🔍 Validating specs/*.json...")
    
    specs_dir = Path("specs")
    if not specs_dir.exists():
        print("  ❌ specs/ directory not found")
        return False
    
    schemas = list(specs_dir.glob("*.schema.json"))
    if not schemas:
        print("  ❌ No schema files found")
        return False
    
    try:
        from jsonschema import Draft7Validator
        
        for schema_file in schemas:
            with open(schema_file) as f:
                schema = json.load(f)
            
            # Simple check: schema is valid JSON
            Draft7Validator.check_schema(schema)
            print(f"  ✅ {schema_file.name}")
        
        return True
    except ImportError:
        print("  ⚠️  jsonschema not installed (pip install jsonschema)")
        return True  # Skip validation if library not available
    except Exception as e:
        print(f"  ❌ Schema validation failed: {e}")
        return False


def validate_runtimes():
    """Validate runtime directories."""
    print("\n🔍 Validating runtimes...")
    
    runtimes = ["python", "nodejs", "rust", "go"]
    for runtime in runtimes:
        runtime_dir = Path(f"runtimes/{runtime}")
        if runtime_dir.exists():
            print(f"  ✅ {runtime}/")
        else:
            print(f"  ⚠️  {runtime}/ (not yet implemented)")
    
    return True


def validate_examples():
    """Validate examples."""
    print("\n🔍 Validating examples...")
    
    examples_dir = Path("examples")
    if not examples_dir.exists():
        print("  ❌ examples/ directory not found")
        return False
    
    readme = examples_dir / "README.md"
    if readme.exists():
        print("  ✅ examples/README.md")
    else:
        print("  ⚠️  examples/README.md (missing)")
    
    return True


def main():
    """Main validation process."""
    print("=" * 60)
    print("Clex-AI-Ultra Core - Validation Script")
    print("=" * 60)
    
    results = []
    
    results.append(("specs", validate_specs()))
    results.append(("runtimes", validate_runtimes()))
    results.append(("examples", validate_examples()))
    
    print("\n" + "=" * 60)
    print("Validation Summary")
    print("=" * 60)
    
    all_passed = True
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {name}: {status}")
        if not passed:
            all_passed = False
    
    print("=" * 60)
    
    if all_passed:
        print("\n✅ Validation passed!")
        return 0
    else:
        print("\n❌ Validation failed!")
        return 1


if __name__ == "__main__":
    sys.exit(main())
