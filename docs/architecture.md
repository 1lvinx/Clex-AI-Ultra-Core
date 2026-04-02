# Clex-AI-Ultra Core - Core Architecture

> Open Source Polyglot Core Edition for AI-assisted Development

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Clex-AI-Ultra Core                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                specs/ (Cross-lang contract)          │   │
│  │                                                        │   │
│  │  skill-manifest.schema.json  (Skill metadata)        │   │
│  │  task-payload.schema.json    (Task data structure)   │   │
│  │  workflow.schema.json        (Workflow definition)   │   │
│  │  permission.schema.json      (Permission rules)      │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                   │
│                           ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                core/runtime-contracts.md             │   │
│  │  - Cross-language communication protocol             │   │
│  │  - Data serialization format                         │   │
│  │  - Error handling conventions                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                   │
│      ┌──────────────────┼──────────────────┐                │
│      ▼                  ▼                  ▼                │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │ Python   │    │ Node.js  │    │  Rust    │             │
│  │ Runtime  │    │ Runtime  │    │ Validator│             │
│  │ (编排层)   │    │ (CLI层)   │    │ (校验层)   │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│                           │                                   │
│                           ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Go Runtime                         │   │
│  │                  (Worker 并发层)                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                   │
│                           ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Skills (保留的 15 个公开安全技能)          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Language Responsibilities

| Language | Primary Responsibility | Key Strengths |
|----------|------------------------|---------------|
| **Python** | Workflow Orchestration | Simple syntax, rich ecosystem, rapid prototyping |
| **Node.js** | CLI Entry Point | Best CLI frameworks (commander/oclif), MCP client |
| **Rust** | Validation & Security | Memory safety, compile-time checks, high performance |
| **Go** | Worker & Concurrency | Goroutines, channels, production-ready backend |

---

## 3. Cross-Language Communication

### Protocol: JSON-RPC 2.0 over HTTP/Unix Socket

### Data Format: JSON Schema Compliant

```json
{
  "jsonrpc": "2.0",
  "method": "permission.evaluate",
  "params": {
    "command": "ls -la"
  },
  "id": 1
}
```

### Error Handling

```json
{
  "error": {
    "code": 400,
    "message": "Invalid command format",
    "data": {
      "field": "command",
      "reason": "pattern mismatch"
    }
  }
}
```

---

## 4. Core Service Layers

| Layer | Language | Responsibilities |
|-------|----------|------------------|
| **Specs Layer** | Language-agnostic | JSON Schema definitions |
| **CLI Layer** | Node.js | User interaction, command routing |
| **Orchestration Layer** | Python | Workflow definition, task scheduling |
| **Validation Layer** | Rust | Manifest, workflow, permission validation |
| **Worker Layer** | Go | Parallel task execution, concurrent workers |

---

## 5. Data Flow

```
User Command → Node.js CLI → Python Orchestrator → Go Worker
                          ↓              ↓
                     Rust Validator  Python SDK
```

---

## 6. Protocol Contracts

| Service | Protocol | Port/Path | Data Format |
|---------|----------|-----------|-------------|
| CLI → Orchestrator | JSON-RPC over Unix Socket | `/tmp/clex-orch.sock` | `workflow.schema.json` |
| Orchestrator → Worker | HTTP + JSON | `localhost:9000` | `task-payload.schema.json` |
| Orchestrator → Validator | FFI / stdin/stdout | N/A | `skill-manifest.schema.json` |
| All ↔ Spec | Internal | N/A | JSON Schema draft-07 |

---

## 7. Capability Group Routing

| Group | Target Language | Reason |
|-------|-----------------|--------|
| G1 (Command Processing) | Node.js → Rust | CLI entry, validation |
| G2 (AI Capability) | Python → Node.js | Orchestration, AI calls |
| G3 (Workflow Orchestration) | Python → Go → Node.js | Main编排, 并发执行 |
| G4 (Protocol Integration) | Python → Node.js | MCP SDK, client |

---

## 8. Development Order

1. **specs/** - Define cross-language contracts
2. **Python MVP** - Workflow orchestrator
3. **Node.js MVP** - CLI entry
4. **Rust Validator** - Schema validation
5. **Go Worker** - Concurrent execution

---

## 9. Security Considerations

- All validation happens in Rust (compile-time safety)
- Permission enforcement in Python/Node.js
- Input sanitization at language boundaries
- No hardcoded credentials

---

## 10. Testing Strategy

| Layer | Test Framework | Coverage |
|-------|---------------|----------|
| specs/ | jsonschema��证器 | Schema validity |
| Python | pytest | Orchestration logic |
| Node.js | Jest | CLI commands |
| Rust | cargo test | Validation logic |
| Go | go test | Worker concurrency |
