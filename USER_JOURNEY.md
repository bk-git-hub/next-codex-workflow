# User Journey Guide

This guide is for someone who has never used `next-codex-workflow` before.

## What This Product Is

`next-codex-workflow` is a setup tool for an existing Next.js repository.

It does not build your app during installation.
It prepares the repository so Codex can work in a repeatable feature workflow:

1. clarify the task when needed
2. plan the change
3. delegate implementation or refactor work to the execution agent
4. verify the result
5. review the result

## Who It Is For

Use this product when:

- you already have a Next.js repository
- you want Codex to follow a more structured workflow for non-trivial work
- you want generated planning, verification, and review artifacts in the repo
- you want short `$skill` commands instead of retyping long prompts

Do not use this product if you expect it to generate a brand-new Next.js app
from scratch. It is an installer for an existing repository.

## The Short Version

The normal user journey looks like this:

1. run `npx next-codex-workflow init`
2. open the repo in Codex
3. use `$plan-feature` for non-trivial work, or open `/skills` and choose it
4. approve the plan
5. use `$build-feature` to implement it
6. use `$verify-feature`
7. use `$review-feature`

## How To Invoke The Workflow

Codex skills are explicitly invoked with `$skill-name`.

For this product, that means:

- `$plan-feature`
- `$build-feature`
- `$verify-feature`
- `$review-feature`

If the user prefers a picker-style interaction, they can open `/skills` and
choose one of those generated skills.

Important detail:

- use `$plan-feature`
- do not expect `/plan-feature`

The built-in slash command is `/skills`, not a repo-defined custom slash command
for each workflow step.

## Step 1: Start Inside An Existing Next.js Repo

The repository should already contain:

- a `package.json`
- a `next` dependency
- at least one router directory such as `app/`, `src/app/`, `pages/`, or
  `src/pages/`

## Step 2: Preview What The Installer Will Do

Recommended first run:

```bash
npx next-codex-workflow init --dry-run
```

This checks whether the repository is supported and shows the files that would
be generated.

Use this when:

- you are trying the package for the first time
- you want to confirm the detected router and scripts
- you want to avoid writing files yet

## Step 3: Install The Workflow

Basic install:

```bash
npx next-codex-workflow init
```

Example with more features:

```bash
npx next-codex-workflow init --performance --external-skill-set full
```

What happens during `init`:

- the repo is validated as a supported Next.js project
- router style, scripts, package manager, and TypeScript usage are detected
- `AGENTS.md` is created
- `.codex/config.toml` and custom agent files are created
- repo-local skills are created in `.agents/skills/`
- bundled external skills are copied into `.agents/skills/`
- workflow artifact files are created in `agent-workflow/artifacts/`
- verification script is created
- optional performance workflow files are created when `--performance` is used

## Step 4: Understand What The User Gets

After `init`, the target repository includes:

- `AGENTS.md`
- `.codex/config.toml`
- `.codex/agents/planner.toml`
- `.codex/agents/executor.toml`
- `.codex/agents/verifier.toml`
- `.codex/agents/reviewer.toml`
- `.agents/skills/*`
- `agent-workflow/artifacts/PLAN.md`
- `agent-workflow/artifacts/FILE_SPECS.md`
- `agent-workflow/artifacts/DECISION.md`
- `agent-workflow/artifacts/VERIFY.md`
- `agent-workflow/artifacts/REVIEW.md`
- `agent-workflow/artifacts/PERF.md` when performance mode is enabled
- `scripts/verify-agent-workflow.mjs`
- `scripts/run-lighthouse.mjs` when performance mode is enabled

Think of this as adding a reusable Codex operating system to the repo.

## Step 5: Use The Short Workflow Commands

This product generates short command-like skills so the user does not need to
keep rewriting the same long instructions.

The user can either type the skill directly with `$...` or open `/skills` and
pick the same skill from the list.

### Planning

Use this for non-trivial work:

```text
$plan-feature add saved search filters to the dashboard
```

What Codex should do:

- inspect the relevant code
- clarify ambiguity if needed
- create or update `PLAN.md`
- create or update `FILE_SPECS.md`
- stop before implementation

### Implementation

After the plan is approved:

```text
$build-feature implement the approved saved search filters plan
```

What Codex should do:

- read `PLAN.md` and `FILE_SPECS.md`
- spawn `executor`
- have `executor` implement the approved plan or refactor scope
- have `executor` consult the relevant vendored quality skills before coding
- stop for user choice when a meaningful decision is required
- update `DECISION.md` when the user makes a choice
- finish with verification and review steps

### Verification

After coding:

```text
$verify-feature
```

What Codex should do:

- run the deterministic repository verification workflow
- update `VERIFY.md`
- report blocking and non-blocking failures

### Review

After verification:

```text
$review-feature
```

What Codex should do:

- review the finished work
- look for correctness issues, regressions, and missing tests
- update `REVIEW.md`

## Step 6: Understand Where Subagents Fit

Subagents are one of the strongest parts of this product.

The main Codex session acts as the orchestrator. It keeps the full feature
request, repository context, and workflow state in view, then delegates focused
jobs to narrower workers when that helps.

That means the overall flow is:

1. the orchestrator owns the main task
2. the orchestrator reads the workflow artifacts
3. the orchestrator spawns focused subagents for bounded jobs
4. subagents return results
5. the orchestrator integrates the results and keeps the overall change coherent

This is useful because it can reduce context sprawl in the main thread and let
independent work happen in parallel. It is mainly a workflow-quality and
parallelism benefit, not a guaranteed token-saving mode.

Subagents are most useful during implementation, not during every single task.

Typical pattern:

1. `$plan-feature` creates the plan
2. user approves the plan
3. `$build-feature` implements the plan
4. during implementation Codex may use subagents to:
   - inspect existing code patterns
   - handle isolated UI work
   - handle isolated server/data work
   - prepare focused evidence for verification or review
5. the orchestrator then uses the dedicated verification and review specialists
   for closeout

In the generated setup:

- `planner` is the planning specialist
- `executor` is the implementation and refactor specialist
- `verifier` is the deterministic checks specialist
- `reviewer` is the final review specialist

All four are custom agents generated into `.codex/agents/`. The shortcut
skills are the easy user-facing entrypoints that tell Codex when to use them.

## Step 7: Know When To Use The Structured Flow

Use the structured flow for:

- new features
- route additions or route changes
- server/client boundary changes
- state ownership changes
- non-trivial UI work
- feature work with meaningful testing or verification impact

For a very small edit, the user can still ask Codex directly without first using
`$plan-feature`.

## Step 8: Use Performance Mode When Needed

If `init` was run with `--performance`, the repository also gets performance
workflow support.

Typical follow-up prompt:

```text
Implement the approved feature, then run the performance workflow and update PERF.md.
```

This adds:

- `agent-workflow/artifacts/PERF.md`
- `agent-workflow/config/lighthouserc.cjs`
- `agent-workflow/config/budgets.json`
- `scripts/run-lighthouse.mjs`
- performance audit skill files

## Step 9: Rerun The Installer Safely

The installer can be rerun later.

Normal rerun:

```bash
npx next-codex-workflow init
```

If you want to intentionally refresh files that were previously generated by the
tool:

```bash
npx next-codex-workflow init --overwrite-managed
```

Important behavior:

- this only replaces files already managed by this tool
- it does not overwrite user-owned handwritten files

## Step 10: Common User Prompts

Good first-time prompts after installation:

```text
$plan-feature add email/password login to the app
```

```text
$build-feature implement the approved login plan using subagents where helpful
```

```text
$verify-feature
```

```text
$review-feature
```

The same journey using the built-in skill picker looks like:

1. type `/skills`
2. choose `plan-feature`
3. approve the generated plan
4. type `/skills`
5. choose `build-feature`
6. then run verification and review the same way or with `$verify-feature` and
   `$review-feature`

If the request is unclear:

```text
Use $task-clarification to turn this request into assumptions, constraints, and acceptance criteria before planning: add a better onboarding flow
```

## Step 11: What This Product Does Not Yet Do

Right now this product does not yet provide:

- an `update` command
- an `uninstall` command
- generic framework support outside Next.js
- remote auto-sync for bundled external skills

For the current backlog, see `NOT_IMPLEMENTED_YET.md`.

## Mental Model

The easiest way to understand the product is:

- `init` installs the workflow
- `$plan-feature` defines the work
- `$build-feature` performs the work
- `$verify-feature` proves the work
- `$review-feature` critiques the work

If a new user remembers those five ideas, they can use the product successfully.
