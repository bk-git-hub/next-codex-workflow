# Gstack Working Checklist

This checklist is for building `next-codex-workflow` with `gstack` as a planning and review aid.

Use this checklist for substantial work in this repository. Do not use it to justify embedding `gstack` as a product dependency unless that is the explicit task.

## Goal

Apply the strongest parts of `gstack` to our development process while preserving our own product identity.

## Trigger Conditions

Run this checklist when the task involves:
- major feature design
- workflow or agent changes
- release planning
- benchmark or eval design
- multi-host support
- installation or update behavior
- changes that could alter product identity

## If Actual gstack Is Available

Use this sequence:
1. `/office-hours`
2. `/plan-ceo-review`
3. `/plan-eng-review`
4. implement
5. `/review`

## If Actual gstack Is Not Available

Emulate the same outputs in your own notes or response before coding.

## Required Gates

### 1. Office-Hours Framing

Answer these briefly:
- What problem are we really solving?
- What user pain does this address right now?
- What is the smallest useful wedge?
- What is explicitly out of scope?

### 2. CEO Review

Challenge the plan:
- Is the scope too large for the current release?
- Is there a simpler wedge that proves the same value?
- What is the user-facing benefit?
- What success metric would tell us this was worthwhile?
- What is the biggest strategic risk?

### 3. Engineering Review

Stress the implementation:
- What files and systems are touched?
- What architecture or workflow invariants must remain true?
- What migration or compatibility risks exist?
- What failure modes or edge cases matter most?
- What tests, smoke runs, or benchmark evidence are required?

### 4. Product Identity Check

Do not let the solution blur what this product is.

Keep:
- explicit artifacts
- human approval at planning
- specialist agents around a repo workflow
- Next.js-focused quality defaults

Borrow carefully:
- host-aware skill templating
- Codex, Claude, Gemini abstraction ideas
- metadata generation helpers
- Codex E2E and benchmark patterns

Do not import by default:
- Bun-first runtime model
- browser binary and Playwright installation burden
- home-directory runtime roots or symlink-heavy setup

### 5. Pre-Implementation Summary

Before coding, summarize:
- problem
- recommended approach
- risks
- what to copy from `gstack`
- what to keep as our own design
- what to postpone

## Output Template

Use this exact shape when helpful:

```md
Problem
- ...

Recommendation
- ...

Risks
- ...

Copy From gstack
- ...

Keep Ours
- ...

Postpone
- ...
```

## Notes

- `gstack` is a reference and process aid for this repository.
- `next-codex-workflow` should not become a thin wrapper around `gstack`.
- If a task is too small to justify the full checklist, say so and proceed.
