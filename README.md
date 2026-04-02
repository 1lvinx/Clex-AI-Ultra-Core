# Clex-AI-Ultra Core

> **Open Source Polyglot Core Edition for AI-assisted Development**
Status: Public Alpha — Python MVP, Node.js CLI skeleton, Rust validator skeleton, Go worker skeleton.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](runtimes/python/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](runtimes/nodejs/)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](runtimes/rust/)
[![Go](https://img.shields.io/badge/Go-1.21+-blue.svg)](runtimes/go/)

---

## 🏛️ Core Capabilities

Clex-AI-Ultra Core 是一个**多语言工程化核心版本**，为 OpenClaw 提供 AI-assisted development 能力增强。

| 能力 | 描述 |
|------|------|
| **Polyglot Engine** | Python/Node.js/Rust/Go 四语言协同 |
| **Workflow Orchestration** | 高阶编排与任务调度 |
| **Permission Control** | 细粒度安全控制 |
| **Agent Coordination** | 多 Agent 协作 |
| **MCP Integration** | Model Context Protocol 集成 |

---

## 📦 Directory Structure

```
Clex-AI-Ultra-Core/
├── README.md
├── LICENSE
├── SECURITY.md
├── contributing.md
├── CHANGELOG.md
├── .gitignore
├── specs/                          # 📐 统一规范层
│   ├── skill-manifest.schema.json
│   ├── task-payload.schema.json
│   ├── workflow.schema.json
│   ├── permission.schema.json
│   └── README.md
├── core/                           # 🎯 核心契约
│   ├── skill-mapping.json
│   └── runtime-contracts.md
├── docs/                           # 📚 项目文档
│   ├── overview.md
│   ├── architecture.md
│   ├── capability-groups.md
│   ├── roadmap.md
│   └── release-plan.md
├── skills/                         # 🧩 15 个公开安全技能
├── runtimes/                       # 🚀 四语言运行时
│   ├── python/                     # Python Runtime (编排层)
│   │   ├── src/clex_python_core/
│   │   ├── sdk/
│   │   ├── examples/
│   │   └── docs/
│   ├── nodejs/                     # Node.js Runtime (CLI层)
│   │   ├── src/cli/
│   │   ├── src/sdk/
│   │   ├── examples/
│   │   └── docs/
│   ├── rust/                       # Rust Runtime (校验层)
│   │   ├── src/bin/
│   │   ├── src/lib/
│   │   ├── examples/
│   │   └── docs/
│   └── go/                         # Go Runtime (worker并发层)
│       ├── cmd/worker/
│       ├── internal/
│       ├── examples/
│       └── docs/
├── examples/                       # 📖 示例与演示
│   ├── manifests/
│   ├── workflows/
│   ├── python/
│   ├── nodejs/
│   ├── rust/
│   └── go/
└── scripts/                        # 🔧 辅助脚本
    ├── bootstrap.sh
    ├── bootstrap.ps1
    └── validate-all.py
```

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-org>/Clex-AI-Ultra-Core.git
cd Clex-AI-Ultra-Core

# Install Python runtime
cd runtimes/python
pip install -e .

# Install Node.js runtime
cd ../nodejs
npm install

# Validate installation
python scripts/validate-all.py
```

### Usage

```bash
# Python workflow orchestration
python -m clex_python_core.workflow examples/demo_workflow.json

# Node.js CLI
node runtimes/nodejs/src/cli/index.js list-skills

# Rust validation
./runtimes/rust/clex-check manifest specs/skill-manifest.schema.json
```

---

## 🎯 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Clex-AI-Ultra Core                        │
├─────────────────────────────────────────────────────────────┤
│  spec/ (Cross-lang contract) → define schemas               │
│  core/ (Runtime contracts) → define protocols                │
│  runtimes/python/ → workflow orchestration                  │
│  runtimes/nodejs/ → CLI entrypoint                          │
│  runtimes/rust/ → validation & security                     │
│  runtimes/go/ → concurrent workers                            │
│  skills/ → 15 public-safe skills                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Capability Groups

| Group | Name | Skills |
|-------|------|--------|
| G1 | Command Processing | cli-commands, command-classifier, permission-engine |
| G2 | AI Capability | ai-code-assistant, code-analysis, test-framework |
| G3 | Workflow Orchestration | ai-workflows, task-dispatcher, background-tasks |
| G4 | Protocol Integration | mcp-integration |

See `docs/capability-groups.md` for full details.

---

## 🛡️ Security

This repository is public-safe:
- No credentials, tokens, or secrets
- No leaked or proprietary code
- No internal source code from other projects

See [SECURITY.md](SECURITY.md) for details.

---

## 📝 Roadmap

| Version | Status | Features |
|---------|--------|----------|
| v0.1.0-alpha | 🚧 In progress | specs + Python MVP + Node.js MVP |
| v1.0.0-core | 📅 Planned | Full Core Edition |
| v1.1.0-extended | 📅 Planned | Extended Edition |
| v2.0.0-local | 📅 Planned | Local/Private Edition |

See `docs/roadmap.md` for details.

---

## 🤝 Contributing

See [contributing.md](contributing.md) for contribution guidelines.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

_© 2026 Clex-AI-Ultra Team. This is an independent open source project, not affiliated with any company._
