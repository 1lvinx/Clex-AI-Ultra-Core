# Agent Communication - Agent 通信机制

> 实现 Agent 之间的高效通信和协作

## 功能

- ✅ 消息队列
- ✅ 发布/订阅模式
- ✅ 请求/响应模式
- ✅ 消息持久化
- ✅ 消息路由
- ✅ 优先级队列

## 命令

```bash
/msg send <to> <message>              # 发送消息
/msg broadcast <message>              # 广播消息
/msg subscribe <topic>                # 订阅主题
/msg history [agent] [limit]          # 查看消息历史
/msg queue list                       # 查看消息队列
```

## 使用示例

```bash
# 发送直接消息
/msg send dev1 "请审查这段代码"

# 广播消息
/msg broadcast "开始每日站会"

# 订阅主题
/msg subscribe code-review

# 发布到主题
/msg publish code-review "新的 PR 待审查"

# 查看消息历史
/msg history dev1 20
```

## 消息类型

| 类型 | 说明 | 优先级 |
|------|------|--------|
| `direct` | 直接消息 | normal |
| `broadcast` | 广播消息 | normal |
| `request` | 请求消息 | high |
| `response` | 响应消息 | normal |
| `notification` | 通知消息 | low |
| `urgent` | 紧急消息 | urgent |

## 通信模式

| 模式 | 说明 | 示例 |
|------|------|------|
| `direct` | 一对一 | Agent A → Agent B |
| `broadcast` | 一对多 | Agent A → All |
| `publish-subscribe` | 主题订阅 | Publisher → Topic → Subscribers |
| `request-response` | 请求响应 | Agent A → Request → Agent B → Response |
