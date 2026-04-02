# Contributing / 贡献指南

Thank you for your interest in contributing to Clex-AI-Ultra!  
感谢你关注并参与 Clex-AI-Ultra 的改进。

## How to Contribute / 如何贡献

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run the validation script**
   ```bash
   uv run python scripts/validate-skills.py
   ```
5. **Review your diff**
   ```bash
   git diff --stat
   git diff
   ```
6. **Submit a Pull Request**

> If your environment does not use `uv`, run the equivalent command with your local Python runtime.  
> 如果你的环境不使用 `uv`，请用本地 Python 运行等价命令。

## Skill Contribution Guidelines / 技能贡献规范

All contributed skills should:

- Have a clear purpose
- Include a complete `SKILL.md`
- Follow the naming convention `skill-name`
- Avoid hardcoded paths, secrets, or environment-specific notes
- Be validated before submission

所有提交的技能都应当：

- 目标明确
- 包含完整的 `SKILL.md`
- 遵循 `skill-name` 命名规范
- 避免硬编码路径、凭证或环境专属说明
- 在提交前通过校验

## Code Style / 代码风格

- Use consistent indentation
- Add comments for non-obvious logic
- Follow existing repository structure and naming patterns

- 使用一致的缩进风格
- 为不直观的逻辑补充注释
- 遵循现有仓库结构与命名方式

## Security Reminder / 安全提醒

Before opening a Pull Request:

- Remove local notes and environment traces
- Do not commit `.env`, keys, tokens, logs, or session files
- Keep personal machine notes in `TOOLS.local.md`, not tracked files

发起 Pull Request 前请确认：

- 已移除本地备注和环境痕迹
- 未提交 `.env`、密钥、Token、日志或会话文件
- 个人机器备注应保存在 `TOOLS.local.md`，不要纳入版本控制

## Questions? / 有问题？

Open an Issue for discussion before large changes.  
较大改动建议先开 Issue 讨论。

---

Thanks for helping make Clex-AI-Ultra better!  
感谢你的贡献。
