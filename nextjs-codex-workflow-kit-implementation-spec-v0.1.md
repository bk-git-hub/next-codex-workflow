
# Next.js Codex Workflow Kit — Implementation Specification

**Document Status:** Build Specification  
**Version:** 0.1  
**Primary Scope:** Feature implementation workflow for existing Next.js repositories  
**Product Type:** npm installer that provisions a repo-local Codex workflow  
**Audience:** Codex, maintainers of this package, and contributors implementing the installer

---

## 1. Purpose

This document is the implementation specification for **Next.js Codex Workflow Kit**.

It is not a positioning document and not a changelog. Its purpose is to define the product precisely enough that Codex can implement the package from this document with minimal ambiguity.

The product is an npm installer that configures an existing Next.js repository so Codex can work inside that repository with a structured workflow for:

1. clarifying feature requests
2. exploring repository context
3. planning implementation
4. recording user decisions
5. implementing changes
6. verifying code deterministically
7. reviewing completed work
8. optionally auditing performance-sensitive routes

---

## 2. Normative language

The keywords **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are used as normative requirement terms.

- **MUST / MUST NOT** = required behavior
- **SHOULD / SHOULD NOT** = recommended behavior unless a strong reason exists to differ
- **MAY** = optional behavior

---

## 3. Product statement

Next.js Codex Workflow Kit is a repo-local installer that provisions a disciplined Codex workflow for Next.js feature implementation through concise project guidance, focused internal skills, narrow custom agents, pinned external quality skills, deterministic verification, structured review, and optional performance auditing.

---

## 4. Product boundaries

### 4.1 In scope

The first shipping version MUST support:

- existing Next.js repositories
- installation by CLI
- repo-local Codex customization
- feature implementation workflow
- planning artifacts
- decision logging
- deterministic verification
- structured post-implementation review
- optional Lighthouse-based performance auditing
- approved external skill vendoring into the repository

### 4.2 Out of scope

The first shipping version MUST NOT require:

- hosted orchestration
- cloud services
- PR review platform features
- provider-agnostic agent orchestration outside Codex
- milestone planning runtime
- generalized workflow support for non-Next.js frameworks
- parallel file writing
- remote fetching of external skills during init

---

## 5. Primary implementation principles

The implementation MUST follow these principles.

1. `AGENTS.md` remains short and durable.
2. Repeated workflows live in repo-local skills.
3. Deterministic work lives in scripts.
4. Repo-local assets are preferred over hidden user-level dependencies.
5. External skills are vendored and pinned, not assumed to be installed elsewhere.
6. Subagents are narrow, explicit, and limited.
7. The parent Codex thread remains the default single writer.
8. Planning is mandatory before non-trivial feature implementation.
9. Verification is mandatory before marking work complete.
10. Review is mandatory before final summary.
11. Performance auditing is optional but first-class.

---

## 6. Target runtime assumptions

The installer MUST assume the target repository:

- is an existing Git repository or working directory
- uses Node.js
- uses Next.js
- may use npm, pnpm, yarn, or bun
- may use App Router or Pages Router
- may or may not have tests
- may or may not have a typecheck script
- may or may not have performance tooling

The installer SHOULD work without network access after the package is installed locally.

The installer MUST NOT require the user to install external skills globally.

---

## 7. Product source repository structure

This section describes the recommended structure of the **workflow kit package itself**.

```text
next-codex-workflow-kit/
  package.json
  README.md
  tsconfig.json
  src/
    cli/
      main.ts
      commands/
        init.ts
    detect/
      detect-next.ts
      detect-package-manager.ts
      detect-router.ts
      detect-scripts.ts
      detect-typescript.ts
      detect-performance-eligibility.ts
    generate/
      write-managed-file.ts
      write-target-tree.ts
      render-template.ts
      generate-agents-md.ts
      generate-codex-config.ts
      generate-agent-files.ts
      generate-internal-skills.ts
      generate-external-skills.ts
      generate-artifacts.ts
      generate-verify-script.ts
      generate-lighthouse-files.ts
      generate-skills-lock.ts
    templates/
      AGENTS.md.hbs
      codex/
        config.toml.hbs
        agents/
          planner.toml.hbs
          reviewer.toml.hbs
          verifier.toml.hbs
      artifacts/
        PLAN.md.hbs
        FILE_SPECS.md.hbs
        DECISION.md.hbs
        VERIFY.md.hbs
        REVIEW.md.hbs
        PERF.md.hbs
      internal-skills/
        task-clarification/
          SKILL.md.hbs
          references/
            clarification-template.md.hbs
        repo-exploration/
          SKILL.md.hbs
          references/
            exploration-checklist.md.hbs
        implementation-strategy/
          SKILL.md.hbs
          references/
            plan-template.md.hbs
            file-spec-template.md.hbs
          agents/
            openai.yaml.hbs
        decision-log/
          SKILL.md.hbs
          references/
            decision-template.md.hbs
        code-change-verification/
          SKILL.md.hbs
          references/
            verify-template.md.hbs
          scripts/
            run-verify.mjs.hbs
        change-review/
          SKILL.md.hbs
          references/
            nextjs-review-checklist.md.hbs
            react-review-checklist.md.hbs
        performance-lighthouse-audit/
          SKILL.md.hbs
          references/
            perf-template.md.hbs
            budgets-template.json.hbs
          scripts/
            run-lighthouse.mjs.hbs
    vendor-skills/
      next-best-practices/
        ...
      vercel-react-best-practices/
        ...
      building-components/
        ...
      web-design-guidelines/
        ...
      vercel-composition-patterns/
        ...
      next-cache-components/
        ...
    manifest/
      approved-external-skills.json
    utils/
      fs.ts
      path.ts
      json.ts
      logging.ts
      package-json.ts
      hashing.ts
  tests/
    init-command.test.ts
    detection.test.ts
    generation.test.ts
    idempotency.test.ts
    fixtures/
      next-app-router/
      next-pages-router/
      next-no-tests/
      next-with-typecheck/
```

### 7.1 Product source design constraints

The package implementation SHOULD:

- be written in TypeScript
- compile to a Node.js CLI entrypoint
- avoid unnecessary runtime dependencies
- isolate repository detection from template rendering
- keep templates readable and versioned in source control
- keep approved external skill snapshots inside `vendor-skills/`

---

## 8. CLI contract

The package MUST provide a CLI entrypoint.

### 8.1 Command

```bash
npx next-codex-workflow init
```

### 8.2 Supported flags

The first version MUST support these flags:

```text
--yes
--performance
--routes <comma-separated-routes>
--external-skill-set <minimal|recommended|full>
--overwrite-managed
--dry-run
```

### 8.3 Flag definitions

- `--yes`
  - accept defaults without interactive confirmation

- `--performance`
  - enable performance extension generation
  - when omitted, performance assets MUST NOT be generated except templates that are safe placeholders

- `--routes`
  - comma-separated list of routes used by Lighthouse auditing
  - only meaningful when `--performance` is enabled

- `--external-skill-set`
  - `minimal` = core only
  - `recommended` = core + supported explicit skills
  - `full` = recommended + eligible optional skills if repo qualifies

- `--overwrite-managed`
  - allow overwriting previously managed files from this product
  - MUST NOT overwrite non-managed user files with the same path unless the user explicitly confirms

- `--dry-run`
  - print planned changes but write nothing

### 8.4 Exit codes

The CLI SHOULD return:

- `0` on success
- `1` on validation or generation failure
- `2` on unsupported repository
- `3` on conflict with unmanaged existing files

---

## 9. Repository eligibility detection

The installer MUST validate the target repository before generating files.

### 9.1 Next.js detection

A repository is considered a valid Next.js repository when all of the following are true:

1. `package.json` exists
2. `package.json` declares `next` in `dependencies` or `devDependencies`
3. at least one of these exists:
   - `app/`
   - `src/app/`
   - `pages/`
   - `src/pages/`

If these conditions are not met, init MUST fail with a clear message.

### 9.2 Router detection

The installer MUST detect router style.

- If `app/` or `src/app/` exists, treat repo as **App Router capable**
- If `pages/` or `src/pages/` exists, treat repo as **Pages Router capable**
- If both exist, record both and prefer App Router wording in generated guidance

### 9.3 TypeScript detection

TypeScript is enabled when either:

- `tsconfig.json` exists, or
- `typescript` exists in `dependencies` or `devDependencies`

### 9.4 Package manager detection

The installer MUST detect package manager using lockfiles in this order:

1. `pnpm-lock.yaml` → `pnpm`
2. `yarn.lock` → `yarn`
3. `bun.lockb` or `bun.lock` → `bun`
4. `package-lock.json` → `npm`

If multiple lockfiles exist, the installer SHOULD fail and ask the user to resolve ambiguity unless `--yes` is given. Under `--yes`, it SHOULD use the highest-priority match listed above and print a warning.

### 9.5 Script detection

The installer MUST inspect `package.json` scripts.

It MUST detect the following script availability:

- `dev`
- `build`
- `lint`
- `test`
- `typecheck`

It MAY detect additional scripts, but only the above are required for this product.

### 9.6 Performance eligibility detection

The installer SHOULD classify performance mode eligibility using:

- Next.js version
- presence of user-facing routes
- build script availability
- dev/start script availability

If performance mode is requested but the repo lacks a usable `build` script, init MAY still generate performance templates but MUST flag the setup as incomplete.

### 9.7 Cache Components eligibility detection

The installer MUST only provision the `next-cache-components` external skill when all are true:

1. Next major version is 16 or higher
2. App Router is present
3. performance or architecture mode is enabled through skill set selection

---

## 10. Managed file policy

This product generates managed files into the target repository.

### 10.1 Managed file definition

A managed file is any file created by this installer and listed in the internal managed path registry.

### 10.2 Overwrite policy

The installer MUST follow these rules:

1. If a managed target path does not exist, create it.
2. If a managed target path exists and contains the installer marker, it MAY be overwritten.
3. If a managed target path exists without the installer marker, init MUST fail unless `--overwrite-managed` is supplied and the user confirms.
4. In `--dry-run`, no writes occur.

### 10.3 Managed file marker

Every generated markdown, TOML, JSON, and script file SHOULD contain a lightweight top comment where the format allows it.

Recommended marker string:

```text
Generated by next-codex-workflow-kit
```

Where the file format does not support comments safely, the path MUST still be treated as managed by the generator's in-memory registry during that run.

### 10.4 Idempotency

Running init multiple times against the same repository with the same options SHOULD produce the same resulting files.

---

## 11. Generated target repository structure

The installer MUST generate the following structure.

```text
AGENTS.md
.codex/
  config.toml
  agents/
    planner.toml
    reviewer.toml
    verifier.toml
.agents/
  skills/
    task-clarification/
      SKILL.md
      references/
        clarification-template.md
    repo-exploration/
      SKILL.md
      references/
        exploration-checklist.md
    implementation-strategy/
      SKILL.md
      references/
        plan-template.md
        file-spec-template.md
      agents/
        openai.yaml
    decision-log/
      SKILL.md
      references/
        decision-template.md
    code-change-verification/
      SKILL.md
      scripts/
        run-verify.mjs
      references/
        verify-template.md
    change-review/
      SKILL.md
      references/
        nextjs-review-checklist.md
        react-review-checklist.md
    performance-lighthouse-audit/
      SKILL.md
      scripts/
        run-lighthouse.mjs
      references/
        perf-template.md
        budgets-template.json
    next-best-practices/
      SKILL.md
      ...
    vercel-react-best-practices/
      SKILL.md
      ...
    building-components/
      SKILL.md
      ...
    web-design-guidelines/
      SKILL.md
      ...
    vercel-composition-patterns/
      SKILL.md
      ...
    next-cache-components/
      SKILL.md
      ...
scripts/
  verify-agent-workflow.mjs
  run-lighthouse.mjs
agent-workflow/
  artifacts/
    PLAN.md
    FILE_SPECS.md
    DECISION.md
    VERIFY.md
    REVIEW.md
    PERF.md
  config/
    lighthouserc.cjs
    budgets.json
  manifest/
    skills-lock.json
```

### 11.1 Conditional generation rules

- `PERF.md`, `run-lighthouse.mjs`, `lighthouserc.cjs`, and `budgets.json` MUST only be generated when performance mode is enabled.
- `building-components`, `web-design-guidelines`, and `vercel-composition-patterns` MUST be generated only for `recommended` or `full` external skill sets.
- `next-cache-components` MUST only be generated when the repository qualifies.
- `skills-lock.json` MUST always be generated when any external skill is provisioned.

---

## 12. AGENTS.md specification

`AGENTS.md` MUST remain concise. It is a routing and repository-operations file, not a long process manual.

### 12.1 Required sections

The generated `AGENTS.md` MUST include these sections in order:

1. `# Repository Overview`
2. `# Commands`
3. `# Workflow Artifacts`
4. `# Feature Work Routing Rules`
5. `# Definition of Done`

### 12.2 Required content

#### 12.2.1 Repository Overview

MUST include:

- whether App Router and/or Pages Router is detected
- important source roots
- where workflow artifacts live

#### 12.2.2 Commands

MUST include the detected commands for:

- dev
- build
- lint
- test if present
- typecheck if present
- performance audit if enabled

#### 12.2.3 Workflow Artifacts

MUST list:

- `agent-workflow/artifacts/PLAN.md`
- `agent-workflow/artifacts/FILE_SPECS.md`
- `agent-workflow/artifacts/DECISION.md`
- `agent-workflow/artifacts/VERIFY.md`
- `agent-workflow/artifacts/REVIEW.md`
- `agent-workflow/artifacts/PERF.md` if enabled

#### 12.2.4 Feature Work Routing Rules

MUST encode rules equivalent to:

1. For non-trivial feature work, do not write implementation code before `PLAN.md` and `FILE_SPECS.md` exist.
2. Use the planning workflow before introducing new routes, server/client boundaries, state ownership changes, or major UI composition changes.
3. If more than one viable strategy exists, ask the user to choose.
4. After a user decision, update `DECISION.md`.
5. After implementation, run verification and update `VERIFY.md`.
6. After verification, run structured review and update `REVIEW.md`.
7. If performance mode is enabled and user-facing routes changed, run performance audit and update `PERF.md`.
8. Final summaries MUST reference artifact outputs.

#### 12.2.5 Definition of Done

MUST include all of:

- implementation completed
- verification attempted
- review completed
- decisions logged when required
- remaining risks called out explicitly

### 12.3 Prohibited content

`AGENTS.md` MUST NOT contain:

- full skill bodies
- large planning templates
- full framework tutorials
- lengthy examples
- external documentation dumps

---

## 13. Project-scoped Codex config specification

The installer MUST generate `.codex/config.toml`.

### 13.1 Required keys

The file MUST include:

```toml
[agents]
max_threads = 4
max_depth = 1

[agents.planner]
description = "Create PLAN.md and FILE_SPECS.md before non-trivial code changes."
config_file = "./agents/planner.toml"

[agents.reviewer]
description = "Review completed changes for correctness, regressions, Next.js issues, and plan compliance."
config_file = "./agents/reviewer.toml"

[agents.verifier]
description = "Run deterministic verification commands and update VERIFY.md."
config_file = "./agents/verifier.toml"
```

### 13.2 Rules

- `max_threads` MUST default to `4`
- `max_depth` MUST default to `1`
- all `config_file` paths MUST be relative to `.codex/`
- the file SHOULD avoid unrelated Codex settings
- the file SHOULD stay small

### 13.3 Trust note

The installer SHOULD print a post-install note reminding the user that project-scoped `.codex/config.toml` is only loaded when the project is trusted.

---

## 14. Custom agent specifications

The installer MUST generate three custom agent TOML files.

### 14.1 Shared requirements for all custom agents

Every custom agent file MUST define:

- `name`
- `description`
- `developer_instructions`

Each custom agent SHOULD be narrow and opinionated.

Each custom agent MAY set:

- `model`
- `model_reasoning_effort`
- `sandbox_mode`
- `nickname_candidates`
- `skills.config`

### 14.2 planner.toml

#### 14.2.1 Required purpose

The planner agent exists to create planning artifacts only.

#### 14.2.2 Required behavior

The planner agent MUST:

- read the task request
- read repository context when needed
- produce `PLAN.md`
- produce `FILE_SPECS.md`
- identify open implementation decisions
- make file boundaries explicit
- define state ownership
- define rendering mode per file when relevant
- define test impact
- avoid writing implementation code

#### 14.2.3 Sandbox

The planner agent SHOULD use `sandbox_mode = "workspace-write"` only if artifact writing requires it. Otherwise it MAY use `read-only`. For alpha, allowing artifact writes is acceptable.

#### 14.2.4 Example template

```toml
name = "planner"
description = "Planning specialist that creates PLAN.md and FILE_SPECS.md before non-trivial code changes."
sandbox_mode = "workspace-write"
developer_instructions = """
You are the planning specialist for this repository.

Your job is to create planning artifacts only.
Do not implement feature code.
Do not edit application source files.
You may update:
- agent-workflow/artifacts/PLAN.md
- agent-workflow/artifacts/FILE_SPECS.md

Your plan must:
- define affected files
- define create/modify/delete actions
- define responsibilities and public APIs
- make server/client boundaries explicit
- define data fetching and mutation placement
- define loading, error, and empty-state expectations
- define test impact and verification expectations
- surface open decisions that require user choice
"""
```

### 14.3 reviewer.toml

#### 14.3.1 Required purpose

The reviewer agent exists to perform post-implementation review.

#### 14.3.2 Required behavior

The reviewer agent MUST:

- inspect changed files and relevant surrounding context
- compare implementation against `PLAN.md` and `FILE_SPECS.md`
- identify correctness risk
- identify regression risk
- identify missing loading, error, or empty-state handling
- identify Next.js and React structure issues
- update `REVIEW.md`
- avoid redesigning architecture unless explicitly asked

#### 14.3.3 Sandbox

The reviewer agent SHOULD use `sandbox_mode = "workspace-write"` because it must update `REVIEW.md`, but MUST NOT edit implementation code.

#### 14.3.4 Example template

```toml
name = "reviewer"
description = "Post-implementation reviewer focused on correctness, regressions, plan compliance, and Next.js quality."
sandbox_mode = "workspace-write"
developer_instructions = """
You are the review specialist for this repository.

Your job is to review completed implementation work and update:
- agent-workflow/artifacts/REVIEW.md

Do not edit application source files.
Evaluate:
- correctness risks
- likely regressions
- missing loading, error, and empty states
- plan compliance
- Next.js and React quality issues
- test coverage gaps visible from the change

Your findings must be prioritized and concrete.
"""
```

### 14.4 verifier.toml

#### 14.4.1 Required purpose

The verifier agent exists to run deterministic checks and update verification artifacts.

#### 14.4.2 Required behavior

The verifier agent MUST:

- invoke the deterministic verification script
- capture pass/fail per command
- update `VERIFY.md`
- avoid freeform code redesign
- optionally run performance audit if instructed

#### 14.4.3 Sandbox

The verifier agent SHOULD use `sandbox_mode = "workspace-write"`.

#### 14.4.4 Example template

```toml
name = "verifier"
description = "Verification specialist that runs deterministic verification commands and updates VERIFY.md."
sandbox_mode = "workspace-write"
developer_instructions = """
You are the verification specialist for this repository.

Your job is to run deterministic verification through the repository script and update:
- agent-workflow/artifacts/VERIFY.md

Do not redesign implementation.
Do not edit application source files unless the parent task explicitly asks for a fix pass after verification.

Report:
- commands run
- pass/fail per command
- summarized failures
- blocking vs non-blocking status
"""
```

---

## 15. Skill system specification

### 15.1 Skill discovery constraints

Every skill directory MUST contain a `SKILL.md`.

Each `SKILL.md` MUST include frontmatter with:

- `name`
- `description`

Example:

```md
---
name: task-clarification
description: Use this skill when a feature request is ambiguous and needs assumptions, constraints, and acceptance criteria before planning.
---
```

### 15.2 Skill directory standard

A skill directory MAY contain:

- `SKILL.md`
- `references/`
- `scripts/`
- `assets/`
- `agents/openai.yaml`

### 15.3 Invocation classes

Each internal or external skill MUST be assigned one invocation class:

- `core-implicit`
- `explicit-only`
- `disabled-unless-enabled`

This classification MUST be represented in installer metadata even if not surfaced directly to Codex.

### 15.4 Internal skill inventory

The installer MUST generate these internal skills:

1. `task-clarification`
2. `repo-exploration`
3. `implementation-strategy`
4. `decision-log`
5. `code-change-verification`
6. `change-review`

The installer SHOULD generate this optional internal skill when performance mode is enabled:

7. `performance-lighthouse-audit`

---

## 16. Internal skill specifications

### 16.1 `task-clarification`

#### 16.1.1 Purpose

Convert a feature request into a scoped implementation brief.

#### 16.1.2 Invocation policy

- class: `core-implicit`

#### 16.1.3 Required triggers

Use when:

- the task is ambiguous
- acceptance criteria are missing
- assumptions need to be surfaced
- constraints must be clarified before planning

#### 16.1.4 Required non-triggers

Do not use when:

- the request is already fully concrete
- the task is trivial and local
- planning artifacts already contain a valid clarified statement

#### 16.1.5 Required outputs

The skill MUST produce:

- clarified task statement
- constraints
- assumptions
- acceptance criteria
- decision candidates

#### 16.1.6 File writes

This skill MUST NOT write application code.

This skill SHOULD NOT create its own artifact file.

#### 16.1.7 Required references

`references/clarification-template.md` MUST include a reusable outline for:

- task summary
- assumptions
- constraints
- acceptance criteria
- open questions

### 16.2 `repo-exploration`

#### 16.2.1 Purpose

Guide repository inspection before planning.

#### 16.2.2 Invocation policy

- class: `core-implicit`

#### 16.2.3 Required triggers

Use when:

- the task is non-trivial
- unfamiliar repository areas are involved
- dependency tracing is needed
- existing patterns must be discovered before planning

#### 16.2.4 Required outputs

The skill MUST produce:

- relevant files
- affected flows
- reusable abstractions
- architecture constraints
- risk notes

#### 16.2.5 File writes

The skill SHOULD NOT write files directly.

#### 16.2.6 Required references

`references/exploration-checklist.md` MUST include prompts for:

- entry routes
- data sources
- shared components
- state ownership patterns
- mutation paths
- validation points
- tests touching affected behavior

### 16.3 `implementation-strategy`

#### 16.3.1 Purpose

Create the concrete implementation contract.

#### 16.3.2 Invocation policy

- class: `explicit-only`

#### 16.3.3 Required triggers

Use when:

- the task is non-trivial
- new files may be created
- existing responsibilities may change
- UI and state boundaries require explicit planning

#### 16.3.4 Required outputs

The skill MUST create or update:

- `agent-workflow/artifacts/PLAN.md`
- `agent-workflow/artifacts/FILE_SPECS.md`

#### 16.3.5 Required planning content

The skill MUST require the planner to define:

- task summary
- affected area summary
- implementation approach
- architecture notes
- file creation/modification/deletion summary
- execution order when relevant
- verification expectations
- open decisions requiring user choice

For each affected file, it MUST define:

- path
- action
- purpose
- responsibility
- public API
- inputs
- outputs
- dependencies
- rendering mode
- state ownership
- data fetching or mutation strategy
- loading/error/empty-state handling
- test impact
- verification expectations
- open decisions

#### 16.3.6 Required references

- `references/plan-template.md`
- `references/file-spec-template.md`

#### 16.3.7 OpenAI metadata

If `agents/openai.yaml` is generated, it SHOULD describe the skill as a planning workflow and MAY declare dependencies on core Next.js and React quality skills.

### 16.4 `decision-log`

#### 16.4.1 Purpose

Record explicit user choices between viable implementation options.

#### 16.4.2 Invocation policy

- class: `core-implicit`

#### 16.4.3 Required triggers

Use when:

- two or more valid implementation strategies exist
- the user chooses one
- the choice has architectural, UX, data, test, or performance consequences

#### 16.4.4 Required writes

The skill MUST update:

- `agent-workflow/artifacts/DECISION.md`

#### 16.4.5 Required record fields

Each entry MUST include:

- timestamp
- task/context
- decision topic
- available options
- user choice
- reason for choice
- tradeoffs/rejected options
- affected files/areas
- follow-up notes

#### 16.4.6 Required references

`references/decision-template.md` MUST provide an append-only decision entry template.

### 16.5 `code-change-verification`

#### 16.5.1 Purpose

Run deterministic checks and update the verification artifact.

#### 16.5.2 Invocation policy

- class: `core-implicit`

#### 16.5.3 Required triggers

Use when:

- implementation is complete
- the change is ready for validation
- before any completion summary

#### 16.5.4 Required writes

The skill MUST update:

- `agent-workflow/artifacts/VERIFY.md`

#### 16.5.5 Required script behavior

The skill MUST call:

- `scripts/verify-agent-workflow.mjs`

#### 16.5.6 Required references

`references/verify-template.md` MUST define the expected `VERIFY.md` structure.

### 16.6 `change-review`

#### 16.6.1 Purpose

Perform structured post-implementation review.

#### 16.6.2 Invocation policy

- class: `core-implicit`

#### 16.6.3 Required triggers

Use when:

- verification has completed
- the change is about to be summarized or handed back to the user

#### 16.6.4 Required writes

The skill MUST update:

- `agent-workflow/artifacts/REVIEW.md`

#### 16.6.5 Required review checks

The skill MUST inspect:

- plan compliance
- correctness risks
- regression risks
- state handling gaps
- Next.js structure issues
- React structure issues
- obvious missing tests

#### 16.6.6 Required references

The skill MUST provide:

- `references/nextjs-review-checklist.md`
- `references/react-review-checklist.md`

### 16.7 `performance-lighthouse-audit`

#### 16.7.1 Purpose

Audit local route performance and record structured performance results.

#### 16.7.2 Invocation policy

- class: `explicit-only`

#### 16.7.3 Required triggers

Use when:

- performance mode is enabled
- user-facing routes changed
- the task affects route content, large assets, images, third-party scripts, analytics, or shell rendering

#### 16.7.4 Required writes

The skill MUST update:

- `agent-workflow/artifacts/PERF.md`

#### 16.7.5 Required script behavior

The skill MUST call:

- `scripts/run-lighthouse.mjs`

#### 16.7.6 Required references

The skill MUST provide:

- `references/perf-template.md`
- `references/budgets-template.json`

---

## 17. External skill policy

The installer MUST treat external skills as vendored, pinned assets.

### 17.1 Provisioning rule

The installer MUST copy approved external skill directories from its own `vendor-skills/` bundle into the target repository under `.agents/skills/`.

The installer MUST NOT fetch skills from the network during init.

### 17.2 Manifest rule

The installer MUST generate `agent-workflow/manifest/skills-lock.json` whenever it copies any external skill.

### 17.3 `skills-lock.json` schema

The file MUST contain one record per installed external skill.

Recommended schema:

```json
{
  "version": 1,
  "skills": [
    {
      "name": "next-best-practices",
      "source": "https://skills.sh/vercel-labs/next-skills/next-best-practices",
      "pin": "pinned-release-or-commit",
      "policy": "core-implicit"
    }
  ]
}
```

### 17.4 Approved external skills

The installer MUST support the following policy decisions.

#### 17.4.1 Core by default

- `next-best-practices`
- `vercel-react-best-practices`

#### 17.4.2 Supported explicit-only

- `building-components`
- `web-design-guidelines`
- `vercel-composition-patterns`

#### 17.4.3 Disabled unless eligible

- `next-cache-components`

#### 17.4.4 Rejected

- Dify-specific frontend testing skill

### 17.5 External skill set presets

- `minimal` → core only
- `recommended` → core + supported explicit-only
- `full` → recommended + eligible optional skills

---

## 18. Deterministic verification specification

The installer MUST generate `scripts/verify-agent-workflow.mjs`.

### 18.1 Script purpose

This script is the single deterministic verification entrypoint for the repository.

### 18.2 Invocation

The script MUST be runnable from the repository root via Node.

Example:

```bash
node scripts/verify-agent-workflow.mjs
```

### 18.3 Required command detection behavior

The script MUST inspect `package.json` and run checks in this order when available:

1. lint
2. typecheck
3. test
4. build

### 18.4 Typecheck fallback

If no `typecheck` script exists, the script MAY use a fallback only when:

- TypeScript is enabled, and
- `tsc` is available through project dependencies

Preferred fallback:

```bash
tsc --noEmit
```

If no safe fallback exists, typecheck MUST be recorded as `not-configured`.

### 18.5 Result model

For each check, the script MUST record:

- command label
- exact command run
- status: `passed` | `failed` | `not-configured`
- duration if available
- summarized output or failure reason

### 18.6 Artifact behavior

The script MAY output machine-readable JSON to stdout, but the workflow MUST update `VERIFY.md` for human-readable artifact output.

### 18.7 Blocking rules

The script SHOULD classify as blocking:

- lint failed
- typecheck failed
- build failed

Test failures SHOULD be blocking by default.

`not-configured` MUST NOT be treated as a pass.

---

## 19. Performance audit specification

When performance mode is enabled, the installer MUST generate:

- `scripts/run-lighthouse.mjs`
- `agent-workflow/config/lighthouserc.cjs`
- `agent-workflow/config/budgets.json`
- `agent-workflow/artifacts/PERF.md`

### 19.1 Script purpose

`run-lighthouse.mjs` MUST run local performance checks against configured routes and write summarized results usable for `PERF.md`.

### 19.2 Required route source

Routes MUST come from:

1. CLI `--routes`, if provided
2. default safe fallback routes:
   - `/`
   - `/dashboard` if present in the repository and discoverable

### 19.3 Required report fields

Performance results MUST include:

- audited routes
- build/start command used
- Lighthouse category scores
- failed assertions
- budget failures
- notable findings
- suggested follow-up actions

### 19.4 Optional bundle support

The first version MAY include a documented bundle-analysis hook, but it MUST remain optional.

### 19.5 Optional Web Vitals support

The first version MAY include guidance for `useReportWebVitals` and `webVitalsAttribution`, but this MUST remain optional guidance rather than required runtime code.

---

## 20. Artifact specifications

The installer MUST generate initial artifact files under `agent-workflow/artifacts/`.

### 20.1 PLAN.md

#### 20.1.1 Required headings

`PLAN.md` MUST include:

- `# Task Summary`
- `# Affected Areas`
- `# Implementation Approach`
- `# Architecture Notes`
- `# File Change Overview`
- `# Execution Order`
- `# Verification Expectations`
- `# Open Decisions`

### 20.2 FILE_SPECS.md

`FILE_SPECS.md` MUST be file-by-file and append/update friendly.

For each affected file, it MUST include:

- file path
- action
- purpose
- responsibility
- public API
- inputs
- outputs
- dependencies
- rendering mode
- state ownership
- data fetching / mutation strategy
- loading / error / empty states
- test impact
- verification expectations
- open decisions

### 20.3 DECISION.md

`DECISION.md` MUST be append-only.

Each decision entry MUST include the fields defined in section 16.4.5.

### 20.4 VERIFY.md

`VERIFY.md` MUST include:

- `# Commands Run`
- `# Results`
- `# Failure Summary`
- `# Blocking Status`
- `# Unresolved Risks`

### 20.5 REVIEW.md

`REVIEW.md` MUST include:

- `# Review Scope`
- `# Findings`
- `# Plan Compliance`
- `# State Handling`
- `# Regression Risks`
- `# Suggested Follow-ups`

### 20.6 PERF.md

When enabled, `PERF.md` MUST include:

- `# Audited Routes`
- `# Run Configuration`
- `# Lighthouse Results`
- `# Budget Findings`
- `# Notable Regressions`
- `# Follow-up Actions`

---

## 21. Workflow runtime protocol

This section defines the workflow Codex is expected to follow in an initialized repository.

### 21.1 Task classification

The workflow MUST classify tasks as **trivial** or **non-trivial**.

A task is **non-trivial** if any of the following are true:

- it changes more than two implementation files
- it introduces a new route, page, layout, or API handler
- it changes server/client boundaries
- it changes data fetching or mutation strategy
- it introduces or restructures shared state
- it introduces a reusable UI component or composition pattern
- it changes tests or verification behavior materially
- it changes user-facing performance-sensitive routes
- it requires a user decision between two viable approaches

A task is **trivial** only when none of the above are true.

### 21.2 Non-trivial workflow order

For non-trivial work, the workflow MUST follow this order:

1. clarify
2. explore
3. plan
4. ask for user decision if required
5. log decision if made
6. implement
7. verify
8. review
9. performance audit if enabled and relevant
10. summarize

### 21.3 Trivial workflow order

For trivial work, planning MAY be lightweight, but the workflow SHOULD still:

- clarify if needed
- implement
- verify
- review
- summarize

### 21.4 Single-writer rule

The parent thread MUST remain the default single writer for application source files.

### 21.5 Subagent rule

Custom agents MUST only be spawned when explicitly requested by workflow instructions or the active Codex task.

---

## 22. Required post-install user instructions

At the end of init, the CLI MUST print a concise summary including:

- detected package manager
- detected router style
- generated paths
- enabled external skills
- whether performance mode is enabled
- reminder that `.codex/config.toml` is only active in trusted projects
- the first recommended Codex prompt

Recommended first prompt:

```text
Implement a feature using the installed workflow. Clarify the task first, inspect the repo, create PLAN.md and FILE_SPECS.md for non-trivial work, ask me if multiple viable approaches exist, then implement, verify, review, and summarize using the workflow artifacts.
```

---

## 23. Test requirements for the workflow kit package

The product repository SHOULD include automated tests for:

- Next.js detection
- package manager detection
- script detection
- router detection
- idempotent file generation
- overwrite conflict handling
- performance-mode generation
- external skill set selection
- skills-lock generation
- managed-file markers

### 23.1 Fixture coverage

Test fixtures SHOULD include at minimum:

- App Router repo
- Pages Router repo
- repo with both routers
- repo without tests
- repo with lint/build only
- repo with TypeScript but no `typecheck` script
- repo eligible for cache-components
- repo in conflict state with unmanaged existing files

---

## 24. Acceptance criteria

The product is accepted when all are true:

1. `npx next-codex-workflow init` runs successfully in a real Next.js repository.
2. Eligibility validation fails clearly in non-Next.js repositories.
3. The target repository receives `AGENTS.md`, `.codex/config.toml`, `.codex/agents/*`, internal skills, artifacts, and verification script.
4. Approved external skills are copied according to the selected preset and eligibility rules.
5. `skills-lock.json` is written correctly.
6. Non-trivial feature work can be performed with planning artifacts created first.
7. Decisions can be logged into `DECISION.md`.
8. Verification is attempted through the deterministic verification script before completion.
9. Review is recorded in `REVIEW.md`.
10. Performance mode creates its files and can produce `PERF.md`.
11. Re-running init with the same options is idempotent.
12. The generated repository layout is readable and usable by Codex without hidden dependencies.

---

## 25. Recommended implementation order for Codex

Codex SHOULD implement the product in this order:

1. CLI bootstrap and argument parsing
2. repository eligibility detection
3. managed-file write system
4. generated target tree rendering
5. `AGENTS.md` generation
6. `.codex/config.toml` generation
7. custom agent TOML generation
8. internal skill generation
9. artifact template generation
10. deterministic verification script generation
11. external skill vendoring and `skills-lock.json`
12. optional performance extension
13. automated tests
14. package README and usage examples

---

## 26. Non-goals for the first implementation pass

The first implementation pass SHOULD NOT attempt:

- worktree orchestration
- PR bot behavior
- generic framework abstraction
- hosted telemetry
- automatic remote updates of vendored skills
- multi-writer execution
- update or uninstall commands unless the init path is stable first

---

## 27. Final instruction to Codex implementing this package

Implement the package so that the generated repository is immediately usable by Codex with minimal manual editing. Favor clarity, reproducibility, idempotency, and small durable generated files over clever abstractions.

When a choice exists between:
- shorter generated guidance and longer hidden logic, or
- durable repo-local guidance and invisible package assumptions,

prefer the durable repo-local guidance.

This product succeeds when a developer can install it once in a Next.js repository and then consistently use Codex with the same structured workflow for non-trivial feature work.
