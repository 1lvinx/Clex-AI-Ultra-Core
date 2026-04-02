# Dev Tools - 开发工具集成

> 测试运行器、代码格式化、依赖管理等开发工具

## 功能

### 测试运行器
- ✅ 自动检测测试框架（Jest/Mocha/Vitest/Pytest）
- ✅ 运行测试（全部/单个/匹配）
- ✅ 测试覆盖率
- ✅ 监听模式
- ✅ 测试报告生成

### 代码格式化
- ✅ Prettier 格式化
- ✅ ESLint 修复
- ✅ Black/Flake8（Python）
- ✅ gofmt（Go）
- ✅ rustfmt（Rust）
- ✅ 批量格式化

### 依赖管理
- ✅ 检测包管理器（npm/yarn/pnpm/pip）
- ✅ 安装/更新/删除依赖
- ✅ 审计安全漏洞
- ✅ 检查过时依赖
- ✅ 生成依赖报告

## 命令

```bash
# 测试
/test run [pattern]                       # 运行测试
/test coverage                            # 运行测试 + 覆盖率
/test watch                               # 监听模式
/test report                              # 生成测试报告

# 格式化
/format [file]                            # 格式化文件
/format all                               # 格式化全部
/lint [file]                              # Lint 检查
/lint fix [file]                          # Lint 自动修复

# 依赖
/deps install [package]                   # 安装依赖
/deps update [package]                    # 更新依赖
/deps remove [package]                    # 删除依赖
/deps audit                               # 安全审计
/deps outdated                            # 检查过时依赖
/deps list                                # 列出依赖
```

## 使用示例

```bash
# 运行测试
/test run
/test run utils
/test run --coverage

# 格式化代码
/format src/index.js
/format all

# Lint 检查
/lint src/
/lint fix src/index.js

# 依赖管理
/deps install lodash
/deps update
/deps audit
/deps outdated
```

## 支持的测试框架

| 框架 | 语言 | 自动检测 |
|------|------|----------|
| Jest | JavaScript | ✅ |
| Vitest | JavaScript | ✅ |
| Mocha | JavaScript | ✅ |
| Pytest | Python | ✅ |
| unittest | Python | ✅ |
| go test | Go | ✅ |
| cargo test | Rust | ✅ |

## 支持的语言

| 语言 | 格式化 | Lint | 依赖管理 |
|------|--------|------|----------|
| JavaScript | ✅ | ✅ | ✅ |
| TypeScript | ✅ | ✅ | ✅ |
| Python | ✅ | ✅ | ✅ |
| Go | ✅ | ✅ | ✅ |
| Rust | ✅ | ✅ | ✅ |
