# Skills Guide / 技能使用指南

## How Skills Work / 技能工作原理

每个技能是一个目录，包含：

```
skill-name/
├─ SKILL.md           # 必需：技能文档（命令定义、功能说明）
├─ index.js          # 可选：JavaScript 实现
├─ scripts/          # 可选：Python/Bash 脚本
├─ references/       # 可选：外部文档引用
└─ assets/           # 可选：图片、图标等资源
```

## Registering Commands / 命令注册

技能通过 `SKILL.md` 中的 `## Commands` 或 `## 命令` 区块注册命令。

示例：
```markdown
## Commands / 命令

```bash
/help my-skill          # 显示帮助
/my-skill action        # 执行操作
```
```

## Best Practices / 最佳实践

1. **统一文档格式**：使用 Markdown 的 `##` 分级标题
2. **命名规范**：命令使用 `skill-action` 格式
3. **错误处理**：所有技能应包含错误处理和用户提示
4. **更新日志**：在 `CHANGELOG.md` 中记录改动

---

_ℹ️ For detailed examples, see individual skill docs_
