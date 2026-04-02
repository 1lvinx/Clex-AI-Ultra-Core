# TOOLS.example.md - Local Tooling Template

This file is a **template** for machine-specific notes.  
Copy it to `TOOLS.local.md` and keep that local file out of version control.

此文件是**模板**，用于记录你自己机器上的环境信息。  
请复制为 `TOOLS.local.md` 后本地使用，不要把 `TOOLS.local.md` 提交到仓库。

## What belongs here / 适合写在这里的内容

- Device nicknames
- SSH host aliases
- Local service names
- Preferred TTS voices
- Browser or runtime notes
- Any setup detail that is useful to you but not suitable for a shared repo

- 设备别名
- SSH 主机别名
- 本地服务名称
- 常用 TTS 声音配置
- 浏览器或运行时备注
- 任何对你有用、但不适合进入共享仓库的环境说明

## Do not store / 不要记录的内容

- Passwords
- API keys
- Tokens
- Private certificates
- Session cookies
- Anything that would grant access if exposed

- 密码
- API Key
- Token
- 私钥或证书
- Session Cookie
- 任何一旦暴露就会导致访问风险的信息

## Suggested workflow / 推荐用法

```bash
cp TOOLS.example.md TOOLS.local.md
```

Then edit `TOOLS.local.md` with your own notes.

## Example structure / 示例结构

```markdown
## SSH

- alias: <HOST_ALIAS>
- host: <IP_OR_HOSTNAME>
- user: <USERNAME>

## TTS

- preferred voice: <VOICE_NAME>
- default output device: <DEVICE_NAME>

## Notes

- browser profile: <PROFILE_NAME>
- local workspace path: <PATH>
```

## Optional ClawX notes / 可选的 ClawX 备注

### uv (Python)

- Prefer: `uv run python <script>`
- Install packages: `uv pip install <package>`

### Browser

- Use your browser automation workflow notes here
- Keep URLs and credentials sanitized

---

`TOOLS.local.md` should be listed in `.gitignore`.  
建议将 `TOOLS.local.md` 加入 `.gitignore`。
