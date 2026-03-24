# next-codex-workflow

Repo-local Codex workflow installer for existing Next.js repositories.

New here: start with `USER_JOURNEY.md` for the end-to-end flow.

## Status

`v0.1` is implemented from
`nextjs-codex-workflow-kit-implementation-spec-v0.1.md`.

## What It Does

`next-codex-workflow` prepares an existing Next.js repository so Codex can use
a structured implementation workflow inside that repository.

During `init`, it:

- validates that the target repository is a supported Next.js project
- detects router style, package manager, scripts, and TypeScript usage
- generates a short `AGENTS.md` with repo-specific workflow rules
- generates project-scoped Codex config and custom agents for planning,
  execution/refactors, testing, verification, and review
- generates repo-local skills for clarification, exploration, planning,
  decision logging, verification, and review
- generates short `$skill-name` workflow shortcuts so users do not need to keep
  retyping long Codex prompts
- supports both `multi-agent` and `single-agent` workflow modes
- vendors approved external skills into the repository from bundled snapshots
  shipped with this package
- creates workflow artifact files as starter templates immediately during init
- writes an install-state manifest so future updates can refresh the workflow
  without re-entering the original setup flags
- creates a deterministic verification script
- optionally adds Lighthouse-based performance audit support

## Supported Repositories

`init` currently expects:

- an existing `package.json`
- `next` declared in dependencies or devDependencies
- at least one of `app/`, `src/app/`, `pages/`, or `src/pages/`

## Usage

```bash
npx next-codex-workflow init
```

After upgrading the package in a repo that already uses this workflow:

```bash
npx next-codex-workflow update
```

Example:

```bash
npx next-codex-workflow init --performance --external-skill-set full
```

Example with explicit workflow mode:

```bash
npx next-codex-workflow init --workflow-mode single-agent
```

## Workflow Shortcuts

Codex supports explicit skill invocation by mentioning a skill with `$`.
If the user prefers a picker UI, they can also open `/skills` and choose one of
the generated workflow skills there.
This package generates a few command-like shortcut skills so users can trigger
the workflow with short prompts instead of rewriting the same instructions.

Examples after `init` in the target repository:

```text
$plan-feature add saved search filters to the dashboard
$build-feature implement the approved dashboard filters plan
$verify-feature
$review-feature
```

These are thin workflow entrypoints built on top of the generated planning,
execution, testing, verification, and review agents plus the installed
repo-local skills.

## Subagent Workflow

One of the main strengths of this package is that it prepares the repository
for orchestrated multi-agent work.

In practice, the main Codex session acts as the orchestrator:

- it keeps the feature request and repo-level goal in view
- it reads the workflow artifacts
- it delegates focused jobs to subagents when helpful
- it collects their results and returns one coherent outcome

The generated custom agents support that workflow:

- `explorer` for read-only repository inspection before planning
- `planner` for planning artifacts
- `executor` for implementation and refactor work
- `tester` for test strategy, test updates, and test-focused checks
- `verifier` for deterministic checks
- `reviewer` for final review

All six agents are expected to consult the relevant vendored quality skills in
`.agents/skills/`. Planning and execution especially use those skills to shape
architecture, file boundaries, implementation details, UI quality, and test
impact. The tester agent uses bundled `vitest`, `playwright-best-practices`,
and `playwright-cli` guidance where relevant.

This is especially useful for larger changes where exploration, implementation,
verification, and review benefit from being split into focused jobs. It is a
quality and parallelism benefit, not a token-saving mode by itself.

## Flags

- `--yes`
  Accept defaults automatically. This is most noticeable when multiple package
  manager lockfiles are found: instead of stopping, the installer uses the
  built-in lockfile priority order and prints a warning.
- `--performance`
  Enables performance-mode generation. This adds the performance audit skill,
  `agent-workflow/artifacts/PERF.md`, `scripts/run-lighthouse.mjs`,
  `agent-workflow/config/lighthouserc.cjs`, and `agent-workflow/config/budgets.json`.
- `--routes <comma-separated-routes>`
  Sets the routes used by the generated Lighthouse performance workflow. This is
  only meaningful together with `--performance`.

  Example:

  ```bash
  npx next-codex-workflow init --performance --routes /,/dashboard,/settings
  ```
- `--external-skill-set <minimal|recommended|full>`
  Controls how many bundled external skills are copied into the target
  repository.

  `minimal`
  Core external skills only. This includes the default testing quality skills.

  `recommended`
  Core skills plus the supported design/component/composition skills.

  `full`
  Everything from `recommended`, plus optional eligible skills such as
  `next-cache-components` for qualifying repositories.
- `--workflow-mode <single-agent|multi-agent>`
  Chooses whether the generated workflow shortcuts keep work in one session or
  route it through specialist spawned agents.

  `multi-agent`
  Uses `explorer`, `planner`, `executor`, `tester`, `verifier`, and `reviewer`
  through the generated shortcut skills.

  `single-agent`
  Keeps the same workflow artifacts and quality-skill guidance, but performs
  planning, implementation, testing, verification, and review in the current
  session instead of spawning specialist agents.
- `--overwrite-managed`
  Allows `init` to replace files that were previously generated by this tool.
  It still stops on user-owned files that already exist at those paths.
- `--dry-run`
  Prints the planned changes and validation results without writing any files.

## Updating An Existing Installation

Use `update` after upgrading the package to refresh files that were previously
generated by this tool:

```bash
npx next-codex-workflow update
```

If the package is installed as a dev dependency, the same flow is:

```bash
pnpm up next-codex-workflow@latest
pnpm next-codex-workflow update
```

`update`:

- reuses the saved install-state manifest from the previous install
- refreshes files previously managed by this tool
- still stops on user-owned unmanaged files
- can fall back to inferring the prior install shape for older repositories
  that do not yet have the install-state manifest
- supports `--dry-run` for previewing the refresh

## External Skill Sets

Current bundled presets:

- `minimal`
  `next-best-practices`, `vercel-react-best-practices`, `vitest`,
  `playwright-best-practices`
- `recommended`
  everything in `minimal`, plus `building-components`,
  `web-design-guidelines`, `vercel-composition-patterns`, and
  `playwright-cli`
- `full`
  everything in `recommended`, plus eligible optional skills such as
  `next-cache-components`

## What It Generates

The files below are generated into the target Next.js repository when you run
`npx next-codex-workflow init`. They do not exist in this package repository by
default because this repository is the installer itself.

- `AGENTS.md`
- `.codex/config.toml`
- `.codex/agents/explorer.toml`
- `.codex/agents/planner.toml`
- `.codex/agents/executor.toml`
- `.codex/agents/tester.toml`
- `.codex/agents/verifier.toml`
- `.codex/agents/reviewer.toml`
- `.agents/skills/*`
- `agent-workflow/artifacts/PLAN.md`
- `agent-workflow/artifacts/FILE_SPECS.md`
- `agent-workflow/artifacts/DECISION.md`
- `agent-workflow/artifacts/VERIFY.md`
- `agent-workflow/artifacts/REVIEW.md`
- `agent-workflow/artifacts/PERF.md` when `--performance` is enabled
- `agent-workflow/manifest/install-state.json`
- `scripts/verify-agent-workflow.mjs`
- `scripts/run-lighthouse.mjs` when `--performance` is enabled

## Workflow Artifacts

These artifact files are created during `init` as starter templates, then
updated later as Codex works through a feature:

- `PLAN.md`
  Implementation plan for non-trivial work.
- `FILE_SPECS.md`
  File-by-file responsibilities, boundaries, and expectations.
- `DECISION.md`
  Append-only log of explicit user choices between viable options.
- `VERIFY.md`
  Human-readable verification record after deterministic checks run.
- `REVIEW.md`
  Structured post-implementation review output.
- `PERF.md`
  Performance audit notes when performance mode is enabled.

## What `init` Does Not Do

- It does not implement application features for you during installation.
- It does not fetch skills from the network during init. Bundled external
  skills are copied from vendored snapshots included in this package.
- It does not wait for a later user request to create the workflow artifact
  files; the artifact files are created immediately as templates during init.

## Development Checks

```bash
npm install
npm run typecheck
npm run build
npm run test
```
