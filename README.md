# Clex-AI-Ultra Core

> **Open Source Polyglot Core Edition for AI-assisted Development**

**Status:** Public Alpha — Python MVP, Node.js CLI skeleton, Rust validator skeleton, Go worker skeleton.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](runtimes/python/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](runtimes/nodejs/)
[![Rust](https://img.shields.io/badge/Rust-1.70%2B-orange.svg)](runtimes/rust/)
[![Go](https://img.shields.io/badge/Go-1.21%2B-blue.svg)](runtimes/go/)

For Chinese documentation, see [README.zh-CN.md](README.zh-CN.md).

---

## Core Capabilities

Clex-AI-Ultra Core is a **polyglot engineering core** designed for OpenClaw, providing AI-assisted development capabilities through workflow orchestration, permission control, and agent coordination.

| Capability | Description |
|------------|-------------|
| **Polyglot Engine** | Python / Node.js / Rust / Go combined |
| **Workflow Orchestration** | High-level orchestration & task scheduling |
| **Permission Control** | Fine-grained access control |
| **Agent Coordination** | Multi-agent collaboration & task dispatch |
| **MCP Integration** | Model Context Protocol integration |

---

## Directory Structure

```
Clex-AI-Ultra-Core/
├── README.md
├── README.zh-CN.md
├── LICENSE
├── SECURITY.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── .gitignore
├── specs/                          # Unified schemas and contracts
│   ├── skill-manifest.schema.json
│   ├── task-payload.schema.json
│   ├── workflow.schema.json
│   ├── permission.schema.json
│   └── README.md
├── core/                           # Core runtime contracts
│   ├── skill-mapping.json
│   └── runtime-contracts.md
├── docs/                           # Project documentation
│   ├── overview.md
│   ├── architecture.md
│   ├── capability-groups.md
│   ├── roadmap.md
│   └── release-plan.md
├── skills/                         # 15 public-safe capability modules
├── runtimes/                       # Polyglot runtime layer
│   ├── python/                     # Python runtime (orchestration, MVP)
│   │   ├── src/clex_python_core/
│   │   ├── sdk/
│   │   ├── examples/
│   │   └── docs/
│   ├── nodejs/                     # Node.js runtime (CLI layer, skeleton)
│   │   ├── src/cli/
│   │   ├── src/sdk/
│   │   ├── examples/
│   │   └── docs/
│   ├── rust/                       # Rust runtime (validation layer, skeleton)
│   │   ├── src/bin/
│   │   ├── src/lib/
│   │   ├── examples/
│   │   └── docs/
│   └── go/                         # Go runtime (worker layer, skeleton)
│       ├── cmd/worker/
│       ├── internal/
│       ├── examples/
│       └── docs/
├── examples/                       # Public alpha demos
│   ├── manifests/
│   ├── workflows/
│   ├── permissions/
│   ├── tasks/
│   ├── python/
│   ├── nodejs/
│   ├── rust/
│   └── go/
└── scripts/                        # Helper scripts
    ├── bootstrap.sh
    ├── bootstrap.ps1
    └── validate-all.py
```

---

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/1lvinx/Clex-AI-Ultra-Core.git
cd Clex-AI-Ultra-Core

# Validate repository structure
uv run python scripts/validate-all.py

# Optional: install Python runtime (MVP)
cd runtimes/python
uv pip install -e .
cd ../..

# Optional: install Node.js runtime (CLI skeleton)
cd runtimes/nodejs
npm install
cd ../..

# Optional: install Rust runtime (Validator skeleton)
cd runtimes/rust
cargo build --release
cd ../..

# Optional: install Go runtime (Worker skeleton)
cd runtimes/go
go build ./cmd/worker
cd ../..
```

### Usage

```bash
# Python workflow orchestration demo (MVP)
uv run python -m clex_python_core.workflow examples/workflows/demo-workflow.json

# Node.js CLI entrypoint (skeleton)
node runtimes/nodejs/src/cli/index.js list-skills

# Rust validation (skeleton)
cargo run --manifest-path runtimes/rust/Cargo.toml --bin clex-check -- manifest specs/skill-manifest.schema.json

# Go worker task dispatch (skeleton)
go run runtimes/go/cmd/worker/main.go
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Clex-AI-Ultra Core                      │
├─────────────────────────────────────────────────────────────┤
│  specs/        → cross-language schemas and contracts      │
│  core/         → runtime mapping and shared protocols      │
│  python/       → workflow orchestration (MVP)              │
│  nodejs/       → CLI entrypoint and developer UX (skeleton)│
│  rust/         → validation and safety checks (skeleton)   │
│  go/           → concurrent workers and task execution (skeleton)│
│  skills/       → 15 public-safe capability modules         │
└─────────────────────────────────────────────────────────────┘
```

---

## Capability Groups

| Group | Name | Skills |
|-------|------|--------|
| G1 | Command Processing | cli-commands, command-classifier, permission-engine, cli-integration |
| G2 | AI Capability | ai-code-assistant, code-analysis, test-framework |
| G3 | Workflow Orchestration | ai-workflows, task-dispatcher, background-tasks |
| G4 | Agent Coordination | agent-teams, agent-communication |

See [`docs/capability-groups.md`](docs/capability-groups.md) for full details.

---

## Runtime Maturity

| Runtime | Completion | Status |
|---------|------------|--------|
| Python | Workflow orchestration + scheduler core | 🟢 MVP (core complete) |
| Node.js | CLI framework structure defined | 🟡 CLI skeleton |
| Rust | JSON Schema validation logic defined | 🟡 Validator skeleton |
| Go | Task dispatcher + worker pool structure | 🟡 Worker skeleton |

---

## Security

This repository is designed as a **public-safe** project:

- No credentials, tokens, or secrets
- No private infrastructure notes
- No unauthorized non-public source materials
- No internal source code from other projects

See [SECURITY.md](SECURITY.md) for details.

---

## Roadmap

| Version | Status | Features |
|---------|--------|----------|
| **v0.1.0-public-alpha** | 🟢 Current | Specs + Python MVP + Skeleton runtimes |
| v1.0.0-core | 📅 Planned | All stages 0-3 complete |
| v1.1.0-extended | 📅 Future | Web UI, Skill marketplace |
| v2.0.0-local | 📅 Future | Local/Private deployment |

See [`docs/roadmap.md`](docs/roadmap.md) for details.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

_© 2026 Clex-AI-Ultra Team. This is an independent open source project and is not affiliated with any company._
