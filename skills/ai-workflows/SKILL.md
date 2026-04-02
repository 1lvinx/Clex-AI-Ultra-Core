# AI Workflows - AI 工作流编排

> 将 AI 能力编排成完整的工作流

## 功能

- ✅ 代码审查工作流
- ✅ PR 处理工作流
- ✅ 自动修复工作流
- ✅ 文档生成工作流
- ✅ 测试生成工作流
- ✅ 重构工作流

## 命令

```bash
/workflow review <file>                     # 代码审查工作流
/workflow pr <number>                       # PR 处理工作流
/workflow fix <file>                        # 自动修复工作流
/workflow docs <path>                       # 文档生成工作流
/workflow test <file>                       # 测试生成工作流
/workflow refactor <file>                   # 重构工作流
```

## 使用示例

```bash
# 代码审查
/workflow review src/index.js

# PR 处理
/workflow pr 123

# 自动修复
/workflow fix src/buggy.js

# 文档生成
/workflow docs ./src

# 测试生成
/workflow test src/utils.js

# 重构
/workflow refactor src/legacy.js
```

## 工作流类型

| 工作流 | 步骤 | 输出 |
|--------|------|------|
| 代码审查 | 分析→检查→建议→报告 | 审查报告 |
| PR 处理 | 获取→审查→测试→建议 | PR 评论 |
| 自动修复 | 检测→分析→修复→验证 | 修复代码 |
| 文档生成 | 扫描→解析→生成→输出 | 文档文件 |
| 测试生成 | 分析→生成→运行→修复 | 测试文件 |
| 重构 | 检测→建议→应用→验证 | 重构代码 |
