# Architecture / 架构设计

## Overall Structure / 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenClaw Core                            │
│  (Gateway, Session Management, Tool Registry)               │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Skill A     │      │  Skill B     │      │  Skill C     │
│ (code)       │      │ (task)       │      │ (cli)        │
└──────────────┘      └──────────────┘      └──────────────┘
```

## Skill Types / 技能类型

### 1. Code Skills / 代码技能
- 功能：提供核心代码操作能力
- 示例：`ai-code-assistant`, `code-analysis`

### 2. Task Skills / 任务技能
- 功能：管理任务生命周期
- 示例：`task-dispatcher`, `background-tasks`

### 3. Integration Skills / 集成技能
- 功能：连接外部协议或服务
- 示例：`mcp-integration`, `cli-integration`

## Load Order / 加载顺序

1. OpenClaw 启动时扫描 `~/.openclaw/workspace/skills/`
2. 加载所有 `SKILL.md` 文件
3. 注册技能命令和工具

---

_ℹ️ More details in `docs/architecture.md`_
