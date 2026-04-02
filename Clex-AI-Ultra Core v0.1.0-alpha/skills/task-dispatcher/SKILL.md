# Task Dispatcher - 任务分配系统

> 智能分配任务给合适的 Agent

## 功能

- ✅ 任务分析（类型、复杂度、技能需求）
- ✅ Agent 匹配算法
- ✅ 负载均衡
- ✅ 智能分发
- ✅ 学习和优化

## 命令

```bash
/dispatch analyze <task>                  # 分析任务
/dispatch find-agent <task>               # 查找最佳 Agent
/dispatch assign <agent> <task>           # 分配任务
/dispatch balance                         # 查看负载平衡
/dispatch stats                           # 查看统计
```

## 使用示例

```bash
# 分析任务
/dispatch analyze "修复登录页面的 bug"
# 输出：
# 类型：debugging
# 复杂度：medium
# 需要技能：['javascript', 'react', 'authentication']
# 预计时间：30 分钟

# 查找最佳 Agent
/dispatch find-agent "编写单元测试"
# 输出：
# 最佳匹配：tester-1 (得分：85)
# 备选：tester-2 (得分：72)

# 分配任务
/dispatch assign tester-1 "编写用户登录测试"
```

## 任务类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `coding` | 编码任务 | 编写功能、重构代码 |
| `debugging` | 调试任务 | 修复 bug、排查问题 |
| `review` | 审查任务 | 代码审查、PR 审核 |
| `research` | 研究任务 | 技术调研、文档阅读 |
| `testing` | 测试任务 | 编写测试、运行测试 |
| `documentation` | 文档任务 | 编写文档、注释 |

## 复杂度等级

| 等级 | 说明 | 预计时间 |
|------|------|----------|
| `simple` | 简单任务 | <15 分钟 |
| `medium` | 中等任务 | 15-60 分钟 |
| `complex` | 复杂任务 | 1-4 小时 |
| `expert` | 专家级任务 | >4 小时 |

## 匹配算法

```
匹配分数 = 
  技能匹配 × 40% +
  负载情况 × 20% +
  历史表现 × 20% +
  模型能力 × 20%
```
