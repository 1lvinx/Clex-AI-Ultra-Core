# specs/ - Cross-Language Specification

> JSON Schema definitions for Clex-AI-Ultra Core

## Files

| File | Purpose | Status |
|------|---------|--------|
| `skill-manifest.schema.json` |Skill metadata and capabilities | ✅ Ready |
| `task-payload.schema.json` | Task data structure | ✅ Ready |
| `workflow.schema.json` | Workflow definition | ✅ Ready |
| `permission.schema.json` | Permission rules | ✅ Ready |

## Schema Versions

All schemas use **JSON Schema draft-07**.

## Usage

```python
# Python example
from jsonschema import validate

with open('specs/skill-manifest.schema.json') as f:
    schema = json.load(f)

validate(instance=my_skill, schema=schema)
```

```typescript
// Node.js example
import { validate } from 'jsonschema';

const result = validate(myTask, taskPayloadSchema);
if (!result.valid) {
  console.error(result.errors);
}
```

```rust
// Rust example
use serde_json::Value;
use schemars::JsonSchema;

#[derive(JsonSchema)]
struct TaskPayload {
    // ...
}
```

## Schema Reference

### skill-manifest.schema.json

Required fields:
- `name`: Skill name (snake_case)
- `version`: Semantic version (e.g., 1.0.0)
- `description`: Object with `en` and `zh` keys
- `capabilityGroup`: One of G1-G4
- `commands`: Array of commands

### task-payload.schema.json

Required fields:
- `id`: Task ID (UUID)
- `type`: Task type
- `prompt`: Task prompt
- `inputs`: Task inputs
- `status`: Task status

### workflow.schema.json

Required fields:
- `id`: Workflow ID
- `name`: Object with `en` and `zh` keys
- `steps`: Array of steps

Each step must include:
- `id`: Step ID
- `name`: Object with `en` and `zh` keys
- `skill`: Target skill name
- `action`: Action name
- `params`: Step parameters

### permission.schema.json

Required fields:
- `id`: Rule ID
- `scope`: One of command, file, network, agent, mcp, workflow
- `matcherType`: One of exact, prefix, suffix, regex, glob
- `resource`: Resource pattern
- `effect`: One of allow, deny
- `priority`: Positive integer

## Validation

Run validation script:
```bash
python scripts/validate-all.py
```

---

_最后更新：2026-04-02_
