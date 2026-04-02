# 中文社区发帖文案

## 版本 1
【开源发布】Clex-AI-Ultra Core v0.1.0-public-alpha

这是一个面向 OpenClaw 生态的多语言工程化核心项目，目标是为 AI-assisted development 提供公开透明的基础架构。

当前设计是四语言分层：
- Python：工作流编排（MVP）
- Node.js：CLI 层（Skeleton）
- Rust：校验层（Skeleton）
- Go：Worker 层（Skeleton）

当前版本已包含：
- 4 个跨语言 JSON Schema
- 核心运行时契约
- 15 个公开安全 skills
- docs / examples / scripts
- Python MVP + 其余运行时骨架

注意：这是 Public Alpha，不是稳定版，也不建议直接用于生产环境。

仓库地址：
https://github.com/1lvinx/Clex-AI-Ultra-Core

欢迎提 Issue、PR 或架构反馈。

## 版本 2
【技术分享】为什么我做了 Clex-AI-Ultra Core？

我想做一个更公开、可维护、可扩展的 AI-assisted development 核心层，而不是只停留在单语言脚本堆叠。

Clex-AI-Ultra Core 当前的思路是：
- 用 JSON Schema 定义跨语言契约
- 用 Python 做编排
- 用 Node.js 做 CLI
- 用 Rust 做校验
- 用 Go 做 worker

当前已经公开的是 Public Alpha：
- Python 为 MVP
- Node.js / Rust / Go 还是 skeleton
- 重点在于把架构基线和工程边界先搭出来

仓库地址：
https://github.com/1lvinx/Clex-AI-Ultra-Core

欢迎对架构、示例、runtime 边界提出建议。