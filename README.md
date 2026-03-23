# next-codex-workflow

Repo-local Codex workflow installer for existing Next.js repositories.

## Status

`v0.1` is implemented from
`nextjs-codex-workflow-kit-implementation-spec-v0.1.md`.

## Usage

```bash
npx next-codex-workflow init
```

Supported flags:

- `--yes`
- `--performance`
- `--routes <comma-separated-routes>`
- `--external-skill-set <minimal|recommended|full>`
- `--overwrite-managed`
- `--dry-run`

## What It Generates

- `AGENTS.md`
- `.codex/config.toml`
- `.codex/agents/*`
- `.agents/skills/*`
- `agent-workflow/artifacts/*`
- `scripts/verify-agent-workflow.mjs`
- `scripts/run-lighthouse.mjs` when `--performance` is enabled

## Development Checks

```bash
npm install
npm run typecheck
npm run build
npm run test
```
