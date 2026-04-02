# Quick Start / 快速开始

## 30-Second Setup / 30 秒快速安装

```powershell
# Windows
Copy-Item -Path "clean_public_repo\skills\*" -Destination "$env:USERPROFILE\.openclaw\workspace\skills\" -Recurse
```

```bash
# Linux/macOS
cp -r clean_public_repo/skills/* ~/.openclaw/workspace/skills/
```

## First Use / 首次使用

1. 重启 OpenClaw
2. 输入 `/help` 查看命令帮助
3. 尝试以下技能：

```bash
# AI 代码助手
/help ai-code-assistant

# 任务分发器
/help task-dispatcher

# CLI 命令封装
/help cli-commands
```

## Common Tasks / 常用操作

| 任务 | 命令 |
|------|------|
| 编写代码 | `/ai-code-assistant generate` |
| 分配任务 | `/task-dispatcher create` |
| 执行 CLI | `/cli-commands exec bash` |
| 执行搜索 | `/multi-search-engine search` |
