# Installation Guide / 安装指南

## Prerequisites / 前置要求

- OpenClaw 已安装
- 熟悉基本命令行操作

## Method 1: Manual Copy / 手动复制

### Windows (PowerShell)

```powershell
# 复制 skills 目录
Copy-Item -Path "C:\path\to\clean_public_repo\skills\*" -Destination "$env:USERPROFILE\.openclaw\workspace\skills\" -Recurse -Force

# 重启 OpenClaw
```

### Linux/macOS

```bash
# 复制 skills 目录
cp -r /path/to/clean_public_repo/skills/* ~/.openclaw/workspace/skills/

# 重启 OpenClaw
```

## Method 2: Automated Installation / 自动化安装

### Windows

```powershell
cd clean_public_repo
.\scripts\install.ps1
```

### Linux/macOS

```bash
cd clean_public_repo
chmod +x scripts/install.sh
./scripts/install.sh
```

## Post-Installation / 安装后配置

1. 重启 OpenClaw
2. 运行 `/help` 查看可用技能
3. 运行 `/skills` 查看已加载技能

## Verification / 验证安装

```bash
# 应能看到所有 skills 的帮助命令
/help ai-code-assistant
/help task-dispatcher
# ...
```
