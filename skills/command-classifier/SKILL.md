# Command Classifier - 命令安全分类器

> 自动判断命令的危险性，支持自动批准

## 功能

- ✅ Bash 命令分类
- ✅ PowerShell 命令分类
- ✅ 风险评分（0-100）
- ✅ 只读命令检测
- ✅ 危险模式匹配
- ✅ AST 解析支持

## 命令

```bash
/classify <command>              # 分类命令
/classify batch <commands...>    # 批量分类
/classify test <command>         # 测试命令（详细输出）
```

## 使用示例

```bash
# 分类单个命令
/classify ls -la
# 返回：{ level: 'safe', score: 5, needsApproval: false }

# 分类危险命令
/classify rm -rf /tmp
# 返回：{ level: 'dangerous', score: 75, needsApproval: true }

# 批量分类
/classify batch "ls" "cat file.txt" "rm -rf /tmp"

# 测试命令（详细输出）
/classify test "git push origin main"
# 返回详细信息：风险因素、匹配的模式、建议等
```

## 风险等级

| 等级 | 分数范围 | 说明 | 批准策略 |
|------|----------|------|----------|
| 🔴 CRITICAL | 90-100 | 极度危险 | 永远需要批准 |
| 🟠 DANGEROUS | 60-89 | 危险 | 需要批准 |
| 🟡 MODERATE | 30-59 | 中等风险 | 根据上下文 |
| 🟢 SAFE | 0-29 | 安全 | 自动批准 |

## 内置危险模式

### 高危命令（CRITICAL）
- `rm -rf /`
- `dd if=...`
- `mkfs`
- `> /dev/sda`
- Fork bomb

### 危险命令（DANGEROUS）
- `rm -rf`
- `del /s /q`
- `format`
- `shutdown`
- `kill -9`
- `wget | sh`
- `curl | sh`

### 中等风险（MODERATE）
- `git push`
- `git reset --hard`
- `npm publish`
- `docker rm`
- `kubectl delete`

### 安全命令（SAFE）
- `ls`, `dir`
- `cat`, `type`
- `grep`, `findstr`
- `pwd`, `cd`
- `git status`, `git diff`
