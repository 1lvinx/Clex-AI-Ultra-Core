# Clex-AI-Ultra Core - Runtime Contracts

> Cross-language communication protocol specification

## 1. Overview

This document defines the contract between Python, Node.js, Rust, and Go runtimes.

## 2. Communication Protocol

### Protocol: JSON-RPC 2.0

All inter-runtime communication uses JSON-RPC 2.0 over HTTP/Unix Socket.

### Endpoint Types

| Endpoint | Protocol | Port/Path |
|----------|----------|-----------|
| Orchestrator | Unix Socket | `/tmp/clex-orch.sock` |
| Worker Pool | HTTP | `localhost:9000` |
| Validator | FFI / stdin/stdout | N/A |

## 3. Data Structures

All data structures conform to schemas in `specs/`.

### Task Payload

```json
{
  "id": "uuid",
  "type": "string",
  "prompt": "string",
  "inputs": { "type": "object" },
  "status": "pending|running|completed|failed|cancelled",
  "progress": 0-100,
  "metadata": {
    "startTime": "ISO8601",
    "durationMs": "number"
  }
}
```

### Permission Check Request

```json
{
  "command": "string",
  "shell": "bash|powershell"
}
```

### Permission Check Response

```json
{
  "allowed": "boolean",
  "ruleId": "string|null",
  "reason": "string",
  "mode": "auto|plan|bypass"
}
```

### Workflow Step

```json
{
  "id": "string",
  "name": { "en": "string", "zh": "string" },
  "skill": "string",
  "action": "string",
  "params": { "type": "object" },
  "dependsOn": ["string"],
  "runtimeTarget": "python|nodejs|go|rust",
  "timeoutMs": "number",
  "retry": {
    "count": "number",
    "delayMs": "number"
  },
  "onFailure": "continue|stop|retry|fallback"
}
```

## 4. Error Handling

All errors include:
- `code`: Error code (4xx client, 5xx server)
- `message`: User-friendly message
- `data`: Additional error context

## 5. Language-Specific Bindings

| Language | Binding Type | Package |
|----------|-------------|---------|
| Python | SDK Client | `clex_python_core.sdkclient` |
| Node.js | SDK Client | `@clex/sdk` |
| Rust | FFI / CLI | `clex-validator` |
| Go | HTTP Client | `github.com/clex/go-client` |

## 6. State Management

All runtime state is stored in:
- **In-memory** (session-scoped)
- **Disk** (persistent across restarts)
- **Redis** (distributed, optional)

## 7. Configuration

```yaml
runtimes:
  python:
    host: unix:/tmp/clex-orch.sock
  nodejs:
    host: localhost:3000
  rust:
    binary: ./runtimes/rust/clex-check
  go:
    host: localhost:9000
```

--- 

_生成时间：2026-04-02 12:20_
