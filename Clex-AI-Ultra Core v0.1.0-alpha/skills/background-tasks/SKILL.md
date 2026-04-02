# Background Tasks - 后台任务系统

> 支持后台运行长时间任务，自动进度追踪

## 功能

- ✅ 任务创建和管理
- ✅ 进度追踪
- ✅ 自动通知
- ✅ 任务列表和状态查询
- ✅ 自动后台转换（>2 秒）

## 命令

```bash
/tasks list [status]         # 列出任务（可按状态过滤）
/tasks status <id>           # 查看任务状态
/tasks cancel <id>           # 取消任务
/tasks result <id>           # 获取任务结果
/tasks clear [status]        # 清理已完成任务
```

## 使用示例

```bash
# 列出所有任务
/tasks list

# 列出运行中的任务
/tasks list running

# 查看任务状态
/tasks status task-123

# 取消任务
/tasks cancel task-123

# 获取任务结果
/tasks result task-123

# 清理已完成任务
/tasks clear completed
```

## 任务状态

| 状态 | 说明 |
|------|------|
| `pending` | 等待执行 |
| `running` | 正在执行 |
| `completed` | 已完成 |
| `failed` | 执行失败 |
| `cancelled` | 已取消 |

## 自动后台转换

任务运行超过 2 秒自动转为后台模式，显示进度提示：

```
🔄 正在执行任务... (已运行 3.2 秒)
💡 任务已转入后台运行，完成后会通知您
📊 进度：45%
```

## 任务数据结构

```json
{
  "id": "task-123",
  "name": "代码审查",
  "description": "审查 src/ 目录下的代码",
  "status": "running",
  "progress": 45,
  "createdAt": "2026-04-02T00:00:00Z",
  "updatedAt": "2026-04-02T00:00:03Z",
  "agent": "code-reviewer",
  "prompt": "请审查以下代码...",
  "result": null
}
```
