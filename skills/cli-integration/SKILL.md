# CLI Integration - CLI 命令统一集成

> 将所有技能注册为 OpenClaw CLI 命令

## 命令分类

### 权限与安全（阶段 1）
```bash
/permission check <command>           # 检查命令权限
/permission list                      # 列出权限规则
/permission add <rule>                # 添加权限规则
/permission remove <id>               # 移除权限规则
/classify <command>                   # 分类命令风险
/tasks list                           # 列出后台任务
/tasks stop <id>                      # 停止任务
```

### 多 Agent 协作（阶段 2）
```bash
/agents list                          # 列出 Agent 团队
/agents create <name>                 # 创建团队
/agents assign <task>                 # 分配任务
/progress show                        # 显示进度
```

### MCP 集成（阶段 3）
```bash
/mcp connect <server>                 # 连接 MCP 服务器
/mcp tools                            # 列出可用工具
/mcp call <tool> <args>               # 调用工具
```

### 开发工具（阶段 4）
```bash
/git clone <url> [dir]                # 克隆仓库
/git status                           # 查看状态
/git commit <message>                 # 提交
/analyze <file>                       # 分析代码
/test [pattern]                       # 运行测试
/format [file]                        # 格式化代码
/deps install <pkg>                   # 安装依赖
/deps audit                           # 安全审计
```

### AI 增强（阶段 5）
```bash
/ai generate <prompt>                 # 生成代码
/ai explain <file>                    # 解释代码
/ai fix <file>                        # Bug 修复
/ai refactor <file>                   # 重构建议
/ai docs <file>                       # 生成文档
/workflow review <file>               # 代码审查
/workflow pr <number>                 # PR 审查
```

## 使用示例

```bash
# 权限检查
/permission check "rm -rf /tmp"

# 代码分析
/analyze src/index.js

# 运行测试
/test --coverage

# AI 生成
/ai generate "创建一个快速排序函数"

# 代码审查
/workflow review src/complex.js
```
