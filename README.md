# Clex-AI-Ultra

## Project Overview / 项目简介

**中文**：  
面向 OpenClaw 的 AI 开发增强技能集合与工程化文档包。

**English**:  
A curated OpenClaw skill pack and engineering documentation set for AI-assisted development.

---

## Features / 主要特性

- ✅ **15 curated skills**：覆盖 AI 代码助手、任务分发、MCP 集成、CLI 整合等核心能力
- ✅ **Modular architecture**：每个技能独立目录，可按需启用
- ✅ **Engineering-grade documentation**：提供完整的说明文档、安装说明与贡献规范
- ✅ **Simple installation**：支持直接复制或使用脚本安装
- ✅ **Public-safe repository**：仅包含可公开发布的内容，不包含未授权私有源码、凭证或敏感信息

---

## Directory Structure / 目录结构

```text
Clex-AI-Ultra/
├─ README.md               # 项目说明
├─ LICENSE                 # 开源协议
├─ .gitignore              # Git 忽略规则
├─ CHANGELOG.md            # 更新日志
├─ SECURITY.md             # 安全说明
├─ CONTRIBUTING.md         # 贡献指南
├─ TOOLS.example.md        # 本地工具与环境记录模板
├─ avatars/                # 头像或静态资源
├─ docs/                   # 项目文档
│  ├─ overview.md
│  ├─ installation.md
│  ├─ quick-start.md
│  ├─ architecture.md
│  ├─ skills-guide.md
│  ├─ roadmap.md
│  └─ faq.md
├─ skills/                 # 技能目录（15 个）
│  ├─ agent-communication/
│  ├─ agent-teams/
│  ├─ ai-code-assistant/
│  ├─ ai-workflows/
│  ├─ background-tasks/
│  ├─ cli-commands/
│  ├─ cli-integration/
│  ├─ code-analysis/
│  ├─ command-classifier/
│  ├─ dev-tools/
│  ├─ git-operations/
│  ├─ mcp-integration/
│  ├─ permission-engine/
│  ├─ task-dispatcher/
│  └─ test-framework/
├─ scripts/                # 辅助脚本
│  ├─ install.sh
│  ├─ install.ps1
│  └─ validate-skills.py
```

> `TOOLS.local.md` is recommended for personal machine notes and should stay untracked.  
> 建议将个人机器相关备注写入 `TOOLS.local.md`，并保持不纳入版本控制。

---

## Installation / 安装方式

**Quick install / 快速安装**

```bash
# Linux/macOS
cp -r Clex-AI-Ultra/skills/* ~/.openclaw/workspace/skills/

# Windows (PowerShell)
Copy-Item -Path "Clex-AI-Ultra\skills\*" -Destination "$env:USERPROFILE\.openclaw\workspace\skills\" -Recurse -Force
```

**Script-based install / 脚本安装**

```bash
# Linux/macOS
./scripts/install.sh

# Windows
.\scripts\install.ps1
```

> The default workspace path may vary by deployment. Review the install scripts if your OpenClaw workspace uses a custom location.  
> OpenClaw 的默认工作区路径可能因部署方式不同而变化，如有自定义路径请先检查安装脚本。

---

## Quick Start / 快速开始

1. Copy the `skills/` directory into your OpenClaw workspace.  
   将 `skills/` 复制到你的 OpenClaw 工作区。
2. Restart OpenClaw.  
   重启 OpenClaw。
3. Run `/help` and verify the available skills.  
   运行 `/help` 检查可用技能。
4. Optional: copy `TOOLS.example.md` to `TOOLS.local.md` for machine-specific notes.  
   可选：将 `TOOLS.example.md` 复制为 `TOOLS.local.md`，记录本地环境说明。

---

## Skills Overview / 技能概览

| Skill | Description | 功能描述 |
|-------|-------------|----------|
| `agent-communication` | Agent messaging and coordination | Agent 间通信与协调 |
| `agent-teams` | Multi-agent team management | 多 Agent 团队协作管理 |
| `ai-code-assistant` | AI-assisted programming workflows | AI 辅助编程流程 |
| `ai-workflows` | Workflow orchestration and execution | 工作流编排与执行 |
| `background-tasks` | Background task scheduling | 后台任务调度与跟踪 |
| `cli-commands` | CLI command wrappers | CLI 命令封装与管理 |
| `cli-integration` | CLI tool integration | CLI 工具集成与扩展 |
| `code-analysis` | Code quality analysis | 代码质量分析与检查 |
| `command-classifier` | Command classification and routing | 指令分类与路由 |
| `dev-tools` | Developer utility bundle | 开发者工具集合 |
| `git-operations` | Git operation wrappers | Git 操作封装 |
| `mcp-integration` | Model Context Protocol integration | MCP 协议集成 |
| `permission-engine` | Permission control engine | 权限控制系统 |
| `task-dispatcher` | Task dispatch and scheduling | 任务分发与调度 |
| `test-framework` | Validation and testing support | 测试框架与验证 |

---

## Usage / 使用说明

All skills follow the standard OpenClaw skill layout:

- `SKILL.md` as the primary documentation entry
- Optional runtime helpers such as `index.js`
- Optional support folders like `references/`, `assets/`, or `scripts/`

See `docs/skills-guide.md` for detailed usage guidance.  
更多使用说明请参阅 `docs/skills-guide.md`。

---

## License / 许可证

MIT License.

---

## Security Statement / 安全说明

This repository is intended to be public-safe. It excludes private credentials, environment-specific secrets, unauthorized proprietary source code, and sensitive operational notes. Please review your local files before publishing forks or derived repositories.  
本仓库以可公开发布为目标，不包含私有凭证、环境机密、未授权专有源码或敏感运维记录。发布分支或衍生仓库前，请再次检查你的本地文件。

---

## Contributing / 贡献指南

Issues and Pull Requests are welcome. Please read `CONTRIBUTING.md` before submitting changes.  
欢迎提交 Issue 和 Pull Request，提交前请先阅读 `CONTRIBUTING.md`。

---

## FAQ / 常见问题

See `docs/faq.md` for frequently asked questions.  
常见问题请查看 `docs/faq.md`。
