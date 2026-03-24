# Not Implemented Yet

This file tracks meaningful capabilities that are not part of the current
`v0.1` package behavior.

## Current Scope

Today the package is an `init`-focused installer for existing Next.js
repositories. It validates the repo, generates the workflow scaffold, installs
bundled skills, and creates verification and optional performance files.

## Intentionally Deferred From `v0.1`

- `uninstall` command to remove generated workflow files safely
- worktree orchestration or multi-writer execution
- PR bot or hosted review automation behavior
- generic non-Next framework support
- hosted telemetry or remote control plane
- automatic remote refresh of vendored external skills

## Follow-up Product Improvements

- stronger routing rules in generated `AGENTS.md` so external skills are called
  more explicitly for Next.js, React, component, and design tasks
- a `doctor` or `status` command to explain what was installed and what is
  missing in a target repo
- more guided onboarding after `init`, especially around how to use the
  planner, verifier, reviewer, and workflow artifacts

## Follow-up Engineering Improvements

- fixture-based end-to-end smoke tests against packaged builds
- coverage reporting and thresholds
- tighter Lighthouse budget enforcement in the performance workflow
- stronger npm package metadata and release guards
