# CLI Commands - 命令行集成

> 将权限、分类器、后台任务、工具执行器集成到 OpenClaw 命令系统

## 命令列表

### 权限管理
```bash
/permission add <type> <pattern> <action> [description]  # 添加规则
/permission list [type] [--enabled] [--disabled]         # 列出规则
/permission remove <id>                                   # 删除规则
/permission enable <id>                                   # 启用规则
/permission disable <id>                                  # 禁用规则
/permission evaluate <command>                            # 评估命令
/permission export [file]                                 # 导出规则
/permission import <file>                                 # 导入规则
/permission conflicts                                     # 检测冲突
```

### 命令分类
```bash
/classify <command> [--shell=bash|powershell]            # 分类命令
/classify batch <commands...>                             # 批量分类
/classify test <command> [--details]                      # 测试命令（详细）
```

### 后台任务
```bash
/tasks list [status] [--limit=20]                         # 列出任务
/tasks status <id>                                        # 查看状态
/tasks cancel <id>                                        # 取消任务
/tasks result <id>                                        # 获取结果
/tasks clear [status]                                     # 清理任务
/tasks stats                                              # 查看统计
```

### 工具执行
```bash
/tool exec <name> [params...] [--timeout=30000]           # 执行工具
/tool list                                                # 列出工具
/tool history [limit]                                     # 执行历史
/tool retry <id>                                          # 重试
```

## 使用示例

### 权限管理
```bash
# 添加允许规则
/permission add bash "^ls\\s" allow "允许 ls 命令"

# 添加拒绝规则
/permission add bash "^rm\\s+-rf" deny "禁止 rm -rf"

# 列出所有 bash 规则
/permission list bash

# 评估命令
/permission evaluate "ls -la"
# 输出：✅ 允许 - 匹配规则 #3: 允许 ls 命令

# 导出规则
/permission export rules.json

# 导入规则
/permission import rules.json
```

### 命令分类
```bash
# 分类单个命令
/classify "rm -rf /tmp"
# 输出：
# 🟠 DANGEROUS (75 分)
# 原因：递归删除
# 需要批准：是
# 建议：⚠️ 请仔细检查命令参数

# 批量分类
/classify batch "ls" "cat file.txt" "rm -rf /tmp"

# 详细测试
/classify test "git push origin main" --details
```

### 后台任务
```bash
# 列出运行中的任务
/tasks list running

# 查看任务状态
/tasks status task-123
# 输出：
# 任务：代码审查
# 状态：running
# 进度：45%
# 已运行：3 分 20 秒

# 取消任务
/tasks cancel task-123

# 查看统计
/tasks stats
# 输出：
# 总计：15
# 运行中：2
# 已完成：10
# 失败：1
# 已取消：2
```

### 工具执行
```bash
# 执行工具
/tool exec bash "ls -la"

# 带超时执行
/tool exec bash "npm install" --timeout=60000

# 查看历史
/tool history 10

# 重试失败的工具
/tool retry exec-123
```

## 输出格式

### 权限评估输出
```
✅ 允许
原因：匹配规则 #3: 允许 ls 命令
模式：auto
匹配规则数：1
```

```
❌ 拒绝
原因：匹配规则 #5: 禁止 rm -rf
模式：auto
匹配规则数：1
```

### 命令分类输出
```
🟢 SAFE (5 分)
命令：ls -la
只读：是
需要批准：否
建议：✅ 可以安全执行
```

```
🟠 DANGEROUS (75 分)
命令：rm -rf /tmp
原因：
  - 🟠 DANGEROUS: 递归删除
  - ⚠️ 使用 sudo
只读：否
需要批准：是
建议：⚠️ 请仔细检查命令参数
```

### 任务状态输出
```
📋 任务：task-123
名称：代码审查
状态：🔄 running
进度：█████░░░░░ 45%
已运行：3 分 20 秒
消息：正在分析 src/ 目录...
```

## 集成方式

### OpenClaw 命令注册
```javascript
// 在 OpenClaw 主程序中注册
const { registerCommands } = require('./skills/cli-commands');

registerCommands(openclaw);
```

### 权限检查中间件
```javascript
// 在执行命令前自动检查权限
openclaw.addMiddleware('pre-exec', async (context) => {
  const { command, shell } = context;
  
  const classifier = new CommandClassifier();
  const result = classifier.classify(command, shell);
  
  if (result.needsApproval) {
    const ruleEngine = new RuleEngine();
    const permission = ruleEngine.evaluate(command);
    
    if (!permission.allowed) {
      throw new Error(`权限拒绝：${permission.reason}`);
    }
  }
});
```
