# Agent Teams - Agent 团队管理

> 创建和管理 Agent 团队，实现团队协作

## 功能

- ✅ 团队创建和管理
- ✅ 成员角色分配（Leader/Worker/Observer）
- ✅ 团队上下文共享
- ✅ Agent 注册和发现
- ✅ 团队状态追踪

## 命令

```bash
/team create <name> [options]              # 创建团队
/team list                                 # 列出团队
/team info <id>                            # 查看团队信息
/team add-member <team> <agent> [role]     # 添加成员
/team remove-member <team> <agent>         # 移除成员
/team set-leader <team> <agent>            # 设置队长
/team broadcast <team> <message>           # 广播消息
/team解散 <id>                             # 解散团队
```

## 使用示例

```bash
# 创建团队
/team create dev-team --leader=senior-dev --members=dev1,dev2,dev3

# 查看团队信息
/team info dev-team
# 输出：
# 📋 团队：dev-team
# 队长：senior-dev
# 成员：3 人
# 状态：active

# 添加成员
/team add-member dev-team tester --role=observer

# 广播消息
/team broadcast dev-team "开始新的 Sprint"

# 列出所有团队
/team list
```

## 成员角色

| 角色 | 权限 | 说明 |
|------|------|------|
| `leader` | 全部 | 团队领导，分配任务，做决策 |
| `worker` | 执行任务 | 主要工作者，执行具体任务 |
| `observer` | 只读 | 观察者，查看进度，提供建议 |

## 团队配置

```javascript
{
  name: "dev-team",
  leader: "senior-dev",
  members: [
    { id: "dev1", role: "worker", model: "sonnet" },
    { id: "dev2", role: "worker", model: "sonnet" },
    { id: "tester", role: "observer", model: "haiku" }
  ],
  sharedMemory: true,
  communication: "broadcast", // broadcast | direct | hierarchical
  maxMembers: 10
}
```

## 团队状态

| 状态 | 说明 |
|------|------|
| `active` | 活跃中 |
| `idle` | 空闲 |
| `busy` | 忙碌中 |
| `paused` | 已暂停 |
| `dissolved` | 已解散 |
