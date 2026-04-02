# Security Statement / 安全声明

## Security Policy / 安全政策

This project is maintained with public-release hygiene in mind. The goal is to keep the repository safe to review, fork, and redistribute within its license terms.

本项目以“可公开发布”为前提进行维护，目标是让仓库在许可证允许范围内可被安全审阅、分发与复用。

## What We Protect / 我们重点保护的内容

1. **No credentials** — no API keys, tokens, passwords, certificates, or secrets
2. **No personal data** — no contacts, preferences, private notes, or local infrastructure details
3. **No unauthorized code** — no proprietary, internal, or leaked source code from third parties
4. **No unsafe local state** — no environment-specific caches, logs, session files, or machine-only notes

## Reporting a Security Issue / 漏洞报告方式

If you discover a security problem:

- Open an Issue with `SECURITY` in the title
- Do **not** paste secrets, tokens, or private infrastructure details into a public issue
- Share only the minimum information needed to reproduce the problem
- We will review reports as quickly as practical

如果你发现安全问题：

- 请创建标题包含 `SECURITY` 的 Issue
- **不要** 在公开 Issue 中粘贴密钥、令牌或私有基础设施信息
- 仅提供复现问题所需的最少信息
- 我们会在合理时间内尽快处理

## Security Best Practices / 安全最佳实践

- Keep local notes in untracked files such as `TOOLS.local.md`
- Never commit `.env`, session files, logs, keys, or machine-specific notes
- Review diffs before every commit and push
- Revoke and rotate any credential that was ever committed by mistake

- 将本地备注保存在未跟踪文件中，例如 `TOOLS.local.md`
- 不要提交 `.env`、会话文件、日志、密钥或机器专用说明
- 每次提交和推送前检查 diff
- 一旦误提交凭证，立即吊销并轮换

---

_Last updated: 2026-04-02_
