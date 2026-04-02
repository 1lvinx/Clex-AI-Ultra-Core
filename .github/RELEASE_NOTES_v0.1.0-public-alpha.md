# Clex-AI-Ultra Core v0.1.0-public-alpha

> First Public Alpha Release 
> Status: Public Alpha — Python MVP, Node.js CLI skeleton, Rust validator skeleton, Go worker skeleton

Welcome to the first public alpha release of **Clex-AI-Ultra Core**, an open-source polyglot core toolkit for AI-assisted development in the OpenClaw ecosystem.

This release establishes the project's public baseline:
- cross-language JSON schemas
- shared runtime contracts
- a Python MVP for workflow orchestration
- initial Node.js, Rust, and Go runtime skeletons
- public-safe docs, examples, and capability mapping

## What this project is

Clex-AI-Ultra Core is designed as a **Polyglot Core Edition** for AI-assisted development. It organizes responsibilities across four languages:

- **Python** for workflow orchestration
- **Node.js** for CLI and developer interaction
- **Rust** for validation and safety checks
- **Go** for worker execution and concurrency

## Current scope

### Included in this release

#### Specs
- `specs/skill-manifest.schema.json`
- `specs/task-payload.schema.json`
- `specs/workflow.schema.json`
- `specs/permission.schema.json`

#### Core contracts
- `core/skill-mapping.json`
- `core/runtime-contracts.md`

#### Documentation
- `docs/overview.md`
- `docs/architecture.md`
- `docs/capability-groups.md`
- `docs/roadmap.md`
- `docs/release-plan.md`

#### Runtimes
- `runtimes/python/` — Python MVP
- `runtimes/nodejs/` — CLI skeleton
- `runtimes/rust/` — validator skeleton
- `runtimes/go/` — worker skeleton

#### Examples
- `examples/manifests/demo-skill-manifest.json`
- `examples/permissions/demo-permission-rule.json`
- `examples/tasks/demo-task.json`
- `examples/workflows/demo-workflow.json`

#### Scripts
- `scripts/validate-all.py`
- `scripts/bootstrap.sh`
- `scripts/bootstrap.ps1`

## Runtime maturity

| Runtime | Status | Notes |
|--------|--------|-------|
| Python | MVP | Core orchestration and workflow structure are in place |
| Node.js | CLI skeleton | Command structure is defined, implementation is partial |
| Rust | Validator skeleton | Validation entrypoints are structured, still evolving |
| Go | Worker skeleton | Worker layout and execution model are defined |

## Notes

This is an **alpha release**, not a stable production release.

What you can expect:
- a public architecture baseline
- shared schemas and runtime contracts
- example files for experimentation
- a clear roadmap for future implementation

What you should not expect yet:
- full production-ready runtimes
- complete CLI functionality
- finished validator and worker implementations

## Roadmap

| Version | Target |
|---------|--------|
| `v0.1.0-public-alpha` | Public architecture baseline |
| `v1.0.0-core` | Stable Core Edition |
| `v1.1.0-extended` | Extended integrations |
| `v2.0.0-local` | Local/private edition |

See `docs/roadmap.md` for more details.

## License

MIT License. See `LICENSE` for details.

## Feedback

Issues, discussions, and pull requests are welcome.

> Disclaimer: this is a public alpha release. The architecture baseline is in place, but individual runtimes are still incomplete.