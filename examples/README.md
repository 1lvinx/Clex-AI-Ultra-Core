# Examples / 示例

This directory contains demo files for Clex-AI-Ultra Core Public Alpha validation.

本目录包含 Clex-AI-Ultra Core Public Alpha 的验证示例文件。

## Demo Files / 演示文件

| File / 文件 | Description / 描述 | Runtime / 运行时 |
|-------------|-------------------|------------------|
| `workflows/demo-workflow.json` | 4-step multi-runtime workflow chain (Node.js→Rust→Python→Go) | Python (orchestrator) |
| `manifests/demo-skill-manifest.json` | Skill manifest template with double-language desc | Node.js (CLI) + Python |
| `permissions/demo-permission-rule.json` | 5 permission rules with allow/deny/priority | Rust (validator) |
| `tasks/demo-task.json` | Task payload with durationMs/metadata/status | Go (worker) |

## Usage / 使用方法

### Python Runtime (编排层)

```bash
cd runtimes/python
python -m clex_python_core.workflow ../examples/workflows/demo-workflow.json
```

### Node.js Runtime (CLI 层)

```bash
cd runtimes/nodejs
node src/cli/index.js inspect elvinx-ai-code-assistant ../examples/manifests/demo-skill-manifest.json
node src/cli/clex-check.js manifest ../examples/manifests/demo-skill-manifest.json
```

### Rust Runtime (校验层)

```bash
cd runtimes/rust
cargo run -- clex-check manifest ../examples/manifests/demo-skill-manifest.json
cargo run -- clex-check permission ../examples/permissions/demo-permission-rule.json
cargo run -- clex-check workflow ../examples/workflows/demo-workflow.json
```

### Go Runtime (Worker 并发层)

```bash
cd runtimes/go
go run cmd/worker/main.go --task ../examples/tasks/demo-task.json
```

## Validation / 验证

```bash
# Full validation / 全面验证
python scripts/validate-all.py
```

## Release Status / 发布状态

- **Current**: Public Alpha Prep (v0.1.0-alpha)
- **Status**: Demo files are public-safe, no credentials or sensitive data
- **Next**: v1.0.0-core (full runtime completion)
