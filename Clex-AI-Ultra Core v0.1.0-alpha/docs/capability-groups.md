# Clex-AI-Ultra Core - Capability Groups

> 6 个核心能力组，定义每个 Skill 的职责边界

## G1: Command Processing

**Purpose**: 命令解析、分类、权限控制

**Skills**:
- `cli-commands` - CLI 命令统一集成与管理
- `command-classifier` - 命令风险分类器
- `permission-engine` - 细粒度权限控制系统
- `cli-integration` - CLI 命令统一注册与路由

**Tags**: validation, policy, security

**Runtime Preference**: Node.js (CLI 入口), Python (命令处理), Rust (验证器)

---

## G2: AI Capability

**Purpose**: AI 辅助编程、代码生成、分析、修护

**Skills**:
- `ai-code-assistant` - AI 辅助编程（生成/解释/修复/重构/文档）
- `code-analysis` - 代码质量分析（复杂度/依赖/安全）
- `test-framework` - 测试框架与验证

**Tags**: coding, testing, automation, quality

**Runtime Preference**: Python (编排), Node.js (交互), Rust (验证)

---

## G3: Workflow Orchestration

**Purpose**: 工作流编排、任务调度、Agent 协作

**Skills**:
- `ai-workflows` - AI 工作流编排与执行
- `task-dispatcher` - 智能任务分配与调度
- `background-tasks` - 后台任务调度与进度追踪
- `agent-teams` - Agent 团队管理与协作
- `agent-communication` - Agent 通信机制（消息队列/发布订阅）

**Tags**: workflow, automation, orchestration, collaboration

**Runtime Preference**: Python (主编排), Node.js (调度), Go (并发 worker)

---

## G4: Protocol Integration

**Purpose**: MCP 协议集成

**Skills**:
- `mcp-integration` - Model Context Protocol 客户端

**Tags**: protocol, integration, context

**Runtime Preference**: Python (SDK), Node.js (Client), Go (Network)

---

##tg: Reward: Reward

**Purpose**: 统一奖励机制（预留）

**Skills**: （预留）

**Tags**: （预留）

**Runtime Preference**: （预留）

---

## Skills Index

| Skill | Primary Group | Tags | Runtimes |
|-------|---------------|------|----------|
| cli-commands | G1 | validation, policy, security | nodejs, python |
| command-classifier | G1 | validation, security | nodejs, python, rust |
| permission-engine | G1 | security, policy, access-control | nodejs, python, rust |
| cli-integration | G1 | cli, integration | nodejs |
| ai-code-assistant | G2 | coding, automation | python, nodejs |
| code-analysis | G2 | testing, quality | python, rust |
| test-framework | G2 | testing, validation, quality | python, nodejs |
| ai-workflows | G3 | workflow, automation, pipeline | python, nodejs |
| task-dispatcher | G3 | workflow, orchestration | python, nodejs |
| background-tasks | G3 | workflow, automation | python, nodejs |
| agent-teams | G3 | orchestration, collaboration | python, nodejs |
| agent-communication | G3 | protocol, orchestration | python, nodejs, go |
| mcp-integration | G4 | protocol, integration, context | python, nodejs, go |
