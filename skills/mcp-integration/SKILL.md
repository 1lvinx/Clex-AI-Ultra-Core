# MCP Integration - MCP 集成

> 实现 Model Context Protocol (MCP) 客户端，支持连接外部 MCP 服务器

## 功能

- ✅ MCP 连接管理（Stdio/WebSocket/SSE）
- ✅ 工具发现与调用
- ✅ 资源读取
- ✅ 提示词模板
- ✅ 自动重连
- ✅ 超时管理

## 命令

```bash
/mcp connect <name> <type> <config>   # 连接 MCP 服务器
/mcp disconnect <name>                 # 断开连接
/mcp list                              # 列出所有连接
/mcp tools [server]                    # 列出可用工具
/mcp call <tool> <args>                # 调用工具
/mcp resources [server]                # 列出资源
/mcp read <uri>                        # 读取资源
/mcp prompts [server]                  # 列出提示词模板
```

## 使用示例

```bash
# 连接 Stdio MCP 服务器
/mcp connect filesystem stdio npx -y @modelcontextprotocol/server-filesystem /tmp

# 连接 WebSocket MCP 服务器
/mcp connect database ws ws://localhost:8080/mcp

# 列出可用工具
/mcp tools filesystem
# 输出：
# - read_file
# - write_file
# - list_directory
# - delete_file

# 调用工具
/mcp call read_file '{"path": "/tmp/test.txt"}'

# 读取资源
/mcp read file:///tmp/test.txt
```

## 连接类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `stdio` | 标准输入输出 | 本地进程 |
| `websocket` | WebSocket | ws://localhost:8080 |
| `sse` | Server-Sent Events | http://localhost:8080/sse |

## 支持协议

- ✅ MCP 1.0
- ✅ MCP 2024-11-05
- ✅ 工具调用
- ✅ 资源读取
- ✅ 提示词模板
- ✅ 采样请求
