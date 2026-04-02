# Workflow Demo / 工作流示例

这个目录包含 Clex-AI-Ultra Core 的工作流演示文件。

## 演示链路

1. `workflow-greeting.json` → Python orchestrator
2. `workflow-.task.json` → Node.js CLI

---

## hello world

```json
{
  "id": "hello-world",
  "name": {
    "en": "Hello World",
    "zh": "你好世界"
  },
  "steps": [
    {
      "id": "1",
      "name": {
        "en": "Greeting",
        "zh": "问候"
      },
      "skill": "cli-commands",
      "action": "echo",
      "params": {
        "message": "Hello, Clex-AI-Ultra Core!"
      },
      "timeoutMs": 5000,
      "retry": {
        "count": 2,
        "delayMs": 1000
      },
      "onFailure": "continue"
    }
  ]
}
```

---

_最后更新：2026-04-02_
