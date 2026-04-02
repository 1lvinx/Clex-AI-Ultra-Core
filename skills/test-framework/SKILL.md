# Test Framework - 测试框架

> OpenClaw Skills 测试框架

## 测试结构

```
skills/
├── <skill-name>/
│   ├── SKILL.md
│   ├── index.js
│   └── tests/
│       ├── index.test.js
│       └── fixtures/
```

## 运行测试

```bash
# 运行所有测试
npm test

# 运行特定技能测试
npm test -- skill-name

# 运行测试并生成覆盖率
npm test -- --coverage

# 监听模式
npm test -- --watch
```

## 测试工具

- Jest 测试框架
- 代码覆盖率报告
- 测试fixtures
- Mock 工具

## 示例

```javascript
const { PermissionEngine } = require('../index');

describe('PermissionEngine', () => {
  test('should check command permission', async () => {
    const engine = new PermissionEngine();
    const result = await engine.checkCommand('ls -la');
    expect(result.allowed).toBe(true);
  });
});
```
