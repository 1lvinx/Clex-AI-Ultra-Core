# Code Analysis - 代码分析工具

> 静态代码分析、复杂度计算、代码质量评估

## 功能

- ✅ 代码复杂度分析（Cyclomatic Complexity）
- ✅ 代码行数统计
- ✅ 函数/类提取
- ✅ 依赖分析
- ✅ 代码质量评分
- ✅ 重复代码检测
- ✅ 代码风格检查
- ✅ 安全漏洞扫描

## 命令

```bash
/code analyze <file>                    # 分析代码文件
/code complexity <file>                 # 计算复杂度
/code stats <path>                      # 统计代码行数
/code deps <file>                       # 分析依赖
/code quality <path>                    # 质量评估
/code duplicates <path>                 # 检测重复代码
/code lint <file>                       # 代码风格检查
/code security <file>                   # 安全扫描
```

## 使用示例

```bash
# 分析单个文件
/code analyze src/index.js

# 计算复杂度
/code complexity src/utils.js

# 统计项目代码
/code stats ./src

# 分析依赖
/code deps src/index.js

# 质量评估
/code quality ./src

# 检测重复代码
/code duplicates ./src
```

## 支持语言

| 语言 | 扩展名 | 支持度 |
|------|--------|--------|
| JavaScript | .js, .mjs | ✅ 完全 |
| TypeScript | .ts, .tsx | ✅ 完全 |
| Python | .py | ✅ 完全 |
| Java | .java | ✅ 完全 |
| Go | .go | ✅ 完全 |
| Rust | .rs | ✅ 完全 |
| C/C++ | .c, .cpp, .h | 🟡 部分 |
