# Clex-AI-Ultra Core

> **开源多语言工程化核心版本，专为 AI-assisted development 设计**

**状态：** Public Alpha — Python MVP，Node.js CLI skeleton，Rust validator skeleton，Go worker skeleton。

[![MIT 许可证](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](runtimes/python/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](runtimes/nodejs/)
[![Rust](https://img.shields.io/badge/Rust-1.70%2B-orange.svg)](runtimes/rust/)
[![Go](https://img.shields.io/badge/Go-1.21%2B-blue.svg)](runtimes/go/)

English documentation, see [README.md](README.md)。

---

## 核心能力

Clex-AI-Ultra Core 是一个**多语言工程化核心版本**，为 OpenClaw 提供面向工作流的 AI-assisted development 能力增强。

| 能力 | 描述 |
|------|------|
| **多语言引擎** | Python / Node.js / Rust / Go 四语言协同 |
| **工作流编排** | 高阶编排、任务调度与执行链路组织 |
| **权限控制** | 细粒度权限控制与安全边界 |
| **Agent 协作** | 多 Agent 协作与任务分发 |
| **MCP 集成** | Model Context Protocol 集成能力 |

---

## 目录结构

```
Clex-AI-Ultra-Core/
├── README.md
├── README.zh-CN.md
├── LICENSE
├── SECURITY.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── .gitignore
├── specs/                          # 统一的 Schema 与契约
│   ├── skill-manifest.schema.json
│   ├── task-payload.schema.json
│   ├── workflow.schema.json
│   ├── permission.schema.json
│   └── README.md
├── core/                           # 运行时契约
│   ├── skill-mapping.json
│   └── runtime-contracts.md
├── docs/                           # 项目文档
│   ├── overview.md
│   ├── architecture.md
│   ├── capability-groups.md
│   ├── roadmap.md
│   ├── release-plan.md
│   └── tooling-example.md
├── skills/                         # 15 个公开安全的技能模块
├── runtimes/                       # 多语言运行时层
│   ├── python/                     # Python 运行时（编排层，MVP）
│   │   ├── src/clex_python_core/
│   │   ├── sdk/
│   │   ├── examples/
│   │   └── docs/
│   ├── nodejs/                     # Node.js 运行时（CLI 层，Skeleton）
│   │   ├── src/cli/
│   │   ├── src/sdk/
│   │   ├── examples/
│   │   └── docs/
│   ├── rust/                       # Rust 运行时（校验层，Skeleton）
│   │   ├── src/bin/
│   │   ├── src/lib/
│   │   ├── examples/
│   │   └── docs/
│   └── go/                         # Go 运行时（Worker 层，Skeleton）
│       ├── cmd/worker/
│       ├── internal/
│       ├── examples/
│       └── docs/
├── examples/                       # Public Alpha 示例
│   ├── manifests/
│   ├── workflows/
│   ├── permissions/
│   ├── tasks/
│   ├── python/
│   ├── nodejs/
│   ├── rust/
│   └── go/
└── scripts/                        # 辅助脚本
    ├── bootstrap.sh
    ├── bootstrap.ps1
    └── validate-all.py
```

---

## 快速开始

### 安装

```bash
# 克隆仓库
git clone https://github.com/1lvinx/Clex-AI-Ultra-Core.git
cd Clex-AI-Ultra-Core

# 验证仓库结构
uv run python scripts/validate-all.py

# 可选：安装 Python 运行时（MVP）
cd runtimes/python
uv pip install -e .
cd ../..

# 可选：安装 Node.js 运行时（CLI Skeleton）
cd runtimes/nodejs
npm install
cd ../..

# 可选：安装 Rust 运行时（Validator Skeleton）
cd runtimes/rust
cargo build --release
cd ../..

# 可选：安装 Go 运行时（Worker Skeleton）
cd runtimes/go
go build ./cmd/worker
cd ../..
```

### 使用

```bash
# Python 工作流编排示例（MVP）
uv run python -m clex_python_core.workflow examples/workflows/demo-workflow.json

# Node.js CLI 入口（Skeleton）
node runtimes/nodejs/src/cli/index.js list-skills

# Rust 校验器（Skeleton）
cargo run --manifest-path runtimes/rust/Cargo.toml --bin clex-check -- manifest specs/skill-manifest.schema.json

# Go Worker 任务分发（Skeleton）
go run runtimes/go/cmd/worker/main.go
```

---

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Clex-AI-Ultra Core                      │
├─────────────────────────────────────────────────────────────┤
│  specs/        → 跨语言 Schema 与契约                       │
│  core/         → 运行时映射与共享协议                       │
│  python/       → 工作流编排（MVP）                          │
│  nodejs/       → CLI 入口与开发者体验（Skeleton）           │
│  rust/         → 校验与安全检查（Skeleton）                 │
│  go/           → 并发 Worker 与任务执行（Skeleton）         │
│  skills/       → 15 个公开安全的能力模块                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 能力分组

| 分组 | 名称 | 技能 |
|------|------|------|
| G1 | 命令处理 | cli-commands, command-classifier, permission-engine, cli-integration |
| G2 | AI 能力 | ai-code-assistant, code-analysis, test-framework |
| G3 | 工作流编排 | ai-workflows, task-dispatcher, background-tasks |
| G4 | Agent 协作 | agent-teams, agent-communication |

详见 [`docs/capability-groups.md`](docs/capability-groups.md)。

---

## 运行时成熟度

| 运行时 | 完成度 | 状态 |
|-------|-------|------|
| Python | 工作流编排 + 任务调度核心 | 🟢 MVP（核心完成） |
| Node.js | CLI 框架结构已定义 | 🟡 CLI Skeleton |
| Rust | JSON Schema 校验逻辑已定义 | 🟡 Validator Skeleton |
| Go | 任务分发 + Worker Pool 结构 | 🟡 Worker Skeleton |

---

## 安全声明

本仓库设计为**公开安全项目**：

- 无凭证、Token 或密钥
- 无私有基础设施说明
- 无未授权的非公开源码
- 无其他项目的内部源码

如需记录本地工具配置，请使用 `docs/tooling-example.md` 作为模板，将个人备注保存在单独的 `TOOLS.local.md` 文件中（不纳入版本控制）。

详见 [SECURITY.md](SECURITY.md)。

---

## 路线图

| 版本 | 状态 | 功能 |
|------|------|------|
| **v0.1.0-public-alpha** | 🟢 当前 | Specs + Python MVP + Skeleton runtimes |
| v1.0.0-core | 📅 计划 | 全部 stages 0-3 完成 |
| v1.1.0-extended | 📅 未来 | Web UI + 技能市场 |
| v2.0.0-local | 📅 未来 | 私有部署 + 企业功能 |

详见 [`docs/roadmap.md`](docs/roadmap.md)。

---

## 贡献指南

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 许可证

MIT 许可证 —— 详见 [LICENSE](LICENSE)。

---

_© 2026 Clex-AI-Ultra Team。这是一个独立的开源项目，与任何公司无关联。_
