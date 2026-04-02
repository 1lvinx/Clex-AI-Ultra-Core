# Clex-AI-Ultra Core

> **Open Source Polyglot Core Edition for AI-assisted Development**

**Status:** Public Alpha — Python MVP, Node.js CLI skeleton, Rust validator skeleton, Go worker skeleton.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](runtimes/python/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](runtimes/nodejs/)
[![Rust](https://img.shields.io/badge/Rust-1.70%2B-orange.svg)](runtimes/rust/)
[![Go](https://img.shields.io/badge/Go-1.21%2B-blue.svg)](runtimes/go/)

---

## 🏛️ Core Capabilities

Clex-AI-Ultra Core 是一个**多语言工程化核心版本**，为 OpenClaw 提供面向工作流的 AI-assisted development 增强能力。

| Capability                 | Description                             |
| -------------------------- | --------------------------------------- |
| **Polyglot Engine**        | Python / Node.js / Rust / Go 四语言协同 |
| **Workflow Orchestration** | 高阶编排、任务调度与执行链路组织        |
| **Permission Control**     | 细粒度权限控制与安全边界                |
| **Agent Coordination**     | 多 Agent 协作与任务分发                 |
| **MCP Integration**        | Model Context Protocol 集成能力         |

---

## 📦 Directory Structure

```text
Clex-AI-Ultra-Core/
├── README.md
├── LICENSE
├── SECURITY.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── .gitignore
├── specs/                          # 📐 Unified schemas and contracts
│   ├── skill-manifest.schema.json
│   ├── task-payload.schema.json
│   ├── workflow.schema.json
│   ├── permission.schema.json
│   └── README.md
├── core/                           # 🎯 Core runtime contracts
│   ├── skill-mapping.json
│   └── runtime-contracts.md
├── docs/                           # 📚 Project documentation
│   ├── overview.md
│   ├── architecture.md
│   ├── capability-groups.md
│   ├── roadmap.md
|   ├── tooling-example.md
│   └── release-plan.md
├── skills/                         # 🧩 15 public-safe skills
├── runtimes/                       # 🚀 Polyglot runtime layer
│   ├── python/                     # Python runtime (orchestration)
│   │   ├── src/clex_python_core/
│   │   ├── sdk/
│   │   ├── examples/
│   │   └── docs/
│   ├── nodejs/                     # Node.js runtime (CLI layer)
│   │   ├── src/cli/
│   │   ├── src/sdk/
│   │   ├── examples/
│   │   └── docs/
│   ├── rust/                       # Rust runtime (validation layer)
│   │   ├── src/bin/
│   │   ├── src/lib/
│   │   ├── examples/
│   │   └── docs/
│   └── go/                         # Go runtime (worker layer)
│       ├── cmd/worker/
│       ├── internal/
│       ├── examples/
│       └── docs/
├── examples/                       # 📖 Public alpha demos
│   ├── manifests/
│   ├── workflows/
│   ├── permissions/
│   ├── tasks/
│   ├── python/
│   ├── nodejs/
│   ├── rust/
│   └── go/
└── scripts/                        # 🔧 Helper scripts
    ├── bootstrap.sh
    ├── bootstrap.ps1
    └── validate-all.py
```

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/1lvinx/Clex-AI-Ultra-Core.git
cd Clex-AI-Ultra-Core

# Validate repository structure
python scripts/validate-all.py

# Optional: install Python runtime
cd runtimes/python
pip install -e .

# Optional: install Node.js runtime
cd ../nodejs
npm install
cd ../..
```

### Usage

```bash
# Python workflow orchestration demo
python -m clex_python_core.workflow examples/workflows/demo-workflow.json

# Node.js CLI
node runtimes/nodejs/src/cli/index.js list-skills

# Rust validation
cargo run --manifest-path runtimes/rust/Cargo.toml --bin clex-check -- manifest specs/skill-manifest.schema.json
```

---

## 🎯 Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Clex-AI-Ultra Core                      │
├─────────────────────────────────────────────────────────────┤
│  specs/        → cross-language schemas and contracts      │
│  core/         → runtime mapping and shared protocols      │
│  python/       → workflow orchestration                    │
│  nodejs/       → CLI entrypoint and developer UX           │
│  rust/         → validation and safety checks              │
│  go/           → concurrent workers and task execution     │
│  skills/       → 15 public-safe capability modules         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Capability Groups

| Group | Name                   | Skills                                                       |
| ----- | ---------------------- | ------------------------------------------------------------ |
| G1    | Command Processing     | cli-commands, command-classifier, permission-engine, cli-integration |
| G2    | AI Capability          | ai-code-assistant, code-analysis, test-framework             |
| G3    | Workflow Orchestration | ai-workflows, task-dispatcher, background-tasks              |
| G4    | Agent Coordination     | agent-teams, agent-communication                             |
| G5    | Protocol Integration   | mcp-integration                                              |
| G6    | DevOps Tools           | git-operations, dev-tools                                    |

See [`docs/capability-groups.md`](docs/capability-groups.md) for full details.

---

## 🛡️ Security

This repository is designed as a **public-safe** project:

- No credentials, tokens, or secrets
- No private infrastructure notes
- No unauthorized non-public source materials
- No internal source code from other projects

See [SECURITY.md](SECURITY.md) for details.

---

## 📝 Roadmap

| Version         | Status       | Features                               |
| --------------- | ------------ | -------------------------------------- |
| v0.1.0-alpha    | Public Alpha | specs + Python MVP + runtime skeletons |
| v1.0.0-core     | Planned      | stable Core Edition                    |
| v1.1.0-extended | Planned      | extended integrations                  |
| v2.0.0-local    | Planned      | local/private edition                  |

See [`docs/roadmap.md`](docs/roadmap.md) for details.

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

_© 2026 Clex-AI-Ultra Team. This is an independent open source project and is not affiliated with any company._
