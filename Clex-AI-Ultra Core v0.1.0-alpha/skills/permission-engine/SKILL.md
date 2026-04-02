# Permission Engine - 权限规则引擎

> 细粒度的权限控制，支持自动批准策略

## 功能

- ✅ 权限模式管理（plan/auto/bypass）
- ✅ 规则创建、编辑、删除
- ✅ 规则优先级和冲突检测
- ✅ 命令权限评估
- ✅ 规则存储和加载

## 命令

```bash
/permission add <type> <pattern> <action> [description]  # 添加规则
/permission list                                          # 列出规则
/permission remove <id>                                   # 删除规则
/permission enable <id>                                   # 启用规则
/permission disable <id>                                  # 禁用规则
/permission evaluate <command>                            # 评估命令权限
/permission export [file]                                 # 导出规则
/permission import <file>                                 # 导入规则
```

## 使用示例

```bash
# 添加允许规则
/permission add bash "^ls\\s" allow "允许 ls 命令"

# 添加拒绝规则
/permission add bash "^rm\\s+-rf" deny "禁止 rm -rf"

# 列出所有规则
/permission list

# 评估命令
/permission evaluate "ls -la"
# 返回：{ allowed: true, reason: '匹配规则 #3', mode: 'auto' }

# 导出规则
/permission export rules.json

# 导入规则
/permission import rules.json
```

## 规则格式

```json
{
  "id": "rule-001",
  "type": "bash",
  "pattern": "^ls\\s",
  "action": "allow",
  "priority": 10,
  "description": "允许 ls 命令",
  "enabled": true,
  "createdAt": "2026-04-02T00:00:00Z"
}
```

## 权限模式

- `plan` - 需要计划批准
- `auto` - 自动批准（安全命令）
- `bypass` - 绕过批准（YOLO 模式）

## 规则类型

- `bash` - Bash 命令
- `powershell` - PowerShell 命令
- `file` - 文件操作
- `network` - 网络操作
- `agent` - Agent 操作
