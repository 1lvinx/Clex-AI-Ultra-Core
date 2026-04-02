# Clex-AI-Ultra

## Project Overview / 项目简介

**中文**：
面向 OpenClaw 的 AI 开发增强技能集合与工程化文档包

**English**：
A curated OpenClaw skill pack and engineering documentation set for AI-assisted development

---

## Features / 主要特性

- ✅ **15+ 官方技能**：覆盖 AI 代码助手、任务分发、MCP 集成、CLI 整合等核心能力
- ✅ **模块化架构**：每个技能独立目录，可按需启用
- ✅ **工程化文档**：完整的技能开发文档和最佳实践
- ✅ **零依赖安装**：直接复制到技能目录即可使用
- ✅ **开放安全**：本项目仅包含作者自行编写、整理或基于合法公开资料整理的内容，不包含任何未授权私有源码、凭证或敏感信息。

---

## Directory Structure / 目录结构

```
clean_public_repo/
├─ README.md              # 项目说明
├─ LICENSE                # 开源协议
├─ .gitignore             # Git 忽略规则
├─ CHANGELOG.md           # 更新日志
├─ SECURITY.md            # 安全声明
├─ CONTRIBUTING.md        # 贡献指南
├─ docs/                  # 项目文档
│  ├─ overview.md         # 项目概览
│  ├─ installation.md     # 安装指南
│  ├─ quick-start.md      # 快速开始
│  ├─ architecture.md     # 架构设计
│  ├─ skills-guide.md     # 技能使用指南
│  ├─ roadmap.md          # 发展路线图
│  └─ faq.md              # 常见问题
├─ skills/                # 技能目录（15+ 个）
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
├─ scripts/               # 辅助脚本
│  ├─ install.sh         # Linux/macOS 安装脚本
│  ├─ install.ps1        # Windows 安装脚本
│  └─ validate-skills.py # 技能验证脚本
├─ examples/              # 示例文件
│  ├─ example-workflows.md
│  └─ sample-config/
└─ assets/                # 媒体资源
   └─ images/
```

---

## Installation / 安装方式

**快速安装**（复制到 OpenClaw 技能目录）：
```bash
# Linux/macOS
cp -r clean_public_repo/skills/* ~/.openclaw/workspace/skills/

# Windows (PowerShell)
Copy-Item -Path "clean_public_repo\skills\*" -Destination "$env:USERPROFILE\.openclaw\workspace\skills\" -Recurse
```

**或使用自动化脚本**：
```bash
# Linux/macOS
./scripts/install.sh

# Windows
.\scripts\install.ps1
```

---

## Quick Start / 快速开始

1. 将 `skills/` 复制到你的 OpenClaw 技能目录
2. 重新启动 OpenClaw
3. 运行 `/help` 查看可用技能

---

## Skills Overview / 技能概览

| Skill | 功能描述 |
|-------|---------|
| `agent-communication` | Agent 间通信与消息传递 |
| `agent-teams` | 多 Agent 团队协作管理 |
| `ai-code-assistant` | AI 辅助编程核心能力 |
| `ai-workflows` | AI 工作流编排与执行 |
| `background-tasks` | 后台任务调度与跟踪 |
| `cli-commands` | CLI 命令封装与管理 |
| `cli-integration` | CLI 工具集成与扩展 |
| `code-analysis` | 代码质量分析与检查 |
| `command-classifier` | 指令分类与路由 |
| `dev-tools` | 开发者工具集合 |
| `git-operations` | Git 操作封装 |
| `mcp-integration` | Model Context Protocol 集成 |
| `permission-engine` | 权限控制系统 |
| `task-dispatcher` | 任务分发与调度 |
| `test-framework` | 测试框架与验证 |

---

## Usage / 使用说明

所有技能遵循 OpenClaw 的标准技能格式：
- 每个技能为一个目录
- 主文档为 `SKILL.md`
- 可选辅助文件：`index.js`, `scripts/*.py`, `references/`, `assets/`

详情请参阅 `docs/skills-guide.md`

---

## License / 许可证

MIT License

---

## Security Statement / 安全说明

> 本项目仅包含作者自行编写、整理或基于合法公开资料整理的内容，不包含任何未授权私有源码、凭证或敏感信息。  
> 所有公开代码均符合开源合规要求，使用前请自行核对许可证兼容性。

---

## Contributing / 贡献指南

欢迎提交 Issue 和 PR！

---

## FAQ / 常见问题

详见 `docs/faq.md`

---

_ℹ️ 本项目为阴性测试项目（Negative Testing），仅用于技能工程研究与学习目的。_
