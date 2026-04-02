# AI Code Assistant - AI 代码助手

> 基于 AI 的代码生成、解释、Bug 修复、重构建议

## 功能

### 代码生成
- ✅ 根据注释生成代码
- ✅ 根据函数签名生成实现
- ✅ 根据需求生成完整模块
- ✅ 单元测试生成
- ✅ 样板代码生成

### 代码解释
- ✅ 函数/类解释
- ✅ 代码逻辑说明
- ✅ 算法复杂度分析
- ✅ 依赖关系解释

### Bug 修复
- ✅ 错误分析
- ✅ 修复建议
- ✅ 自动修复
- ✅ 预防措施

### 代码重构
- ✅ 代码异味检测
- ✅ 重构建议
- ✅ 自动化重构
- ✅ 性能优化建议

### 文档生成
- ✅ JSDoc/TSDoc 生成
- ✅ README 生成
- ✅ API 文档
- ✅ 变更日志

## 命令

```bash
/ai generate <prompt> [file]              # 生成代码
/ai explain <file>                        # 解释代码
/ai fix <file>                            # Bug 修复
/ai refactor <file>                       # 重构建议
/ai docs <file>                           # 生成文档
/ai review <file>                         # 代码审查
/ai test <file>                           # 生成测试
```

## 使用示例

```bash
# 生成代码
/ai generate "创建一个快速排序函数" src/sort.js
/ai generate "添加用户验证中间件" src/middleware/auth.js

# 解释代码
/ai explain src/complex-algorithm.js

# Bug 修复
/ai fix src/buggy-code.js

# 重构建议
/ai refactor src/legacy-code.js

# 生成文档
/ai docs src/api.js

# 代码审查
/ai review src/pull-request.js

# 生成测试
/ai test src/utils.js
```

## 支持语言

| 语言 | 生成 | 解释 | 修复 | 重构 | 文档 |
|------|------|------|------|------|------|
| JavaScript | ✅ | ✅ | ✅ | ✅ | ✅ |
| TypeScript | ✅ | ✅ | ✅ | ✅ | ✅ |
| Python | ✅ | ✅ | ✅ | ✅ | ✅ |
| Java | ✅ | ✅ | ✅ | ✅ | ✅ |
| Go | ✅ | ✅ | ✅ | ✅ | ✅ |
| Rust | ✅ | ✅ | ✅ | ✅ | ✅ |
