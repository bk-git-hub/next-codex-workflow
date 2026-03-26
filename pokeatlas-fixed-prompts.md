# PokeAtlas Fixed Prompt Script

This file is the canonical prompt set for testing the workflow against
[`pokeatlas-feature-chunks.md`](./pokeatlas-feature-chunks.md).

Use these prompts when you want repeatable comparisons across:

- single-agent vs multi-agent workflow mode
- different package versions
- different model/runtime setups
- repeated smoke and benchmark runs

## Benchmark Rules

- start both runs from the same repo state
- use the same feature chunk ID in both runs
- paste the prompt text exactly as written
- do not add extra hints, explanations, or architecture suggestions
- if you compare single-agent vs multi-agent, change only the installed workflow
  mode
- if a chunk depends on earlier chunks, either build those dependencies first or
  treat the run as planning-only
- if you are measuring long-session behavior, keep the whole sequence in one
  session
- if you are measuring isolated step quality, start a fresh session per step and
  record that in your notes

## Recommended Comparison Order

Use this order when you want realistic progressive benchmark runs:

1. `PK-012`
2. `PK-013`
3. `PK-001`
4. `PK-002`
5. `PK-004`
6. `PK-003`
7. `PK-005`
8. `PK-007`
9. `PK-008`
10. `PK-015`
11. `PK-006`
12. `PK-009`
13. `PK-014`
14. `PK-010`
15. `PK-011`
16. `PK-016`

## Canonical Approval Prompt

Use this exact approval prompt after reviewing a generated plan:

```text
I approve the current plan. Continue without expanding scope beyond the requested chunk and its explicit dependencies in pokeatlas-feature-chunks.md.
```

## Fixed Prompt Set

### PK-001 Home Experience

Build dependency note:
- recommended after `PK-012` and `PK-013`

Planning:

```text
$plan-feature PK-001 from pokeatlas-feature-chunks.md. Use only the requested chunk and its explicit dependencies in that file.
```

Build:

```text
$build-feature PK-001 from pokeatlas-feature-chunks.md. Use the approved plan and do not expand scope beyond the requested chunk and its explicit dependencies in that file.
```

Verify:

```text
$verify-feature PK-001 from pokeatlas-feature-chunks.md
```

Review:

```text
$review-feature PK-001 from pokeatlas-feature-chunks.md
```

### PK-002 Pokedex Browse

Build dependency note:
- recommended after `PK-012` and `PK-013`

Planning:

```text
$plan-feature PK-002 from pokeatlas-feature-chunks.md. Use only the requested chunk and its explicit dependencies in that file.
```

Build:

```text
$build-feature PK-002 from pokeatlas-feature-chunks.md. Use the approved plan and do not expand scope beyond the requested chunk and its explicit dependencies in that file.
```

Verify:

```text
$verify-feature PK-002 from pokeatlas-feature-chunks.md
```

Review:

```text
$review-feature PK-002 from pokeatlas-feature-chunks.md
```

### PK-003 Search And Filters

Build dependency note:
- build after `PK-002`

Planning:

```text
$plan-feature PK-003 from pokeatlas-feature-chunks.md. Use only the requested chunk and its explicit dependencies in that file.
```

Build:

```text
$build-feature PK-003 from pokeatlas-feature-chunks.md. Use the approved plan and do not expand scope beyond the requested chunk and its explicit dependencies in that file.
```

Verify:

```text
$verify-feature PK-003 from pokeatlas-feature-chunks.md
```

Review:

```text
$review-feature PK-003 from pokeatlas-feature-chunks.md
```

### PK-004 Pokemon Detail Page

Build dependency note:
- build after `PK-002`

Planning:

```text
$plan-feature PK-004 from pokeatlas-feature-chunks.md. Use only the requested chunk and its explicit dependencies in that file.
```

Build:

```text
$build-feature PK-004 from pokeatlas-feature-chunks.md. Use the approved plan and do not expand scope beyond the requested chunk and its explicit dependencies in that file.
```

Verify:

```text
$verify-feature PK-004 from pokeatlas-feature-chunks.md
```

Review:

```text
$review-feature PK-004 from pokeatlas-feature-chunks.md
```

### PK-005 Quick View Modal

Build dependency note:
- build after `PK-002` and `PK-004`

Planning:

```text
$plan-feature PK-005 from pokeatlas-feature-chunks.md. Use only the requested chunk and its explicit dependencies in that file.
```

Build:

```text
$build-feature PK-005 from pokeatlas-feature-chunks.md. Use the approved plan and do not expand scope beyond the requested chunk and its explicit dependencies in that file.
```

Verify:

```text
$verify-feature PK-005 from pokeatlas-feature-chunks.md
```

Review:

```text
$review-feature PK-005 from pokeatlas-feature-chunks.md
```

### PK-006 Compare Experience

Build dependency note:
- build after `PK-004`

Planning:

```text
$plan-feature PK-006 from pokeatlas-feature-chunks.md. Use only the requested chunk and its explicit dependencies in that file.
```

Build:

```text
$build-feature PK-006 from pokeatlas-feature-chunks.md. Use the approved plan and do not expand scope beyond the requested chunk and its explicit dependencies in that file.
```

Verify:

```text
$verify-feature PK-006 from pokeatlas-feature-chunks.md
```

Review:

```text
$review-feature PK-006 from pokeatlas-feature-chunks.md
```

### PK-007 Favorites

Build dependency note:
- build after `PK-002` and `PK-004`

Planning:

```text
$plan-feature PK-007 from pokeatlas-feature-chunks.md. Use only the requested chunk and its explicit dependencies in that file.
```

Build:

```text
$build-feature PK-007 from pokeatlas-feature-chunks.md. Use the approved plan and do not expand scope beyond the requested chunk and its explicit dependencies in that file.
```

Verify:

```text
$verify-feature PK-007 from pokeatlas-feature-chunks.md
```

Review:

```text
$review-feature PK-007 from pokeatlas-feature-chunks.md
```

### PK-008 Team Builder

Build dependency note:
- build after `PK-004`

Planning:

```text
$plan-feature PK-008 from pokeatlas-feature-chunks.md. Use only the requested chunk and its explicit dependencies in that file.
```

Build:

```text
$build-feature PK-008 from pokeatlas-feature-chunks.md. Use the approved plan and do not expand scope beyond the requested chunk and its explicit dependencies in that file.
```

Verify:

```text
$verify-feature PK-008 from pokeatlas-feature-chunks.md
```

Review:

```text
$review-feature PK-008 from pokeatlas-feature-chunks.md
```

### PK-009 Metadata And Sharing

Build dependency note:
- build after `PK-001` and `PK-004`

Planning:

```text
$plan-feature PK-009 from pokeatlas-feature-chunks.md. Use only the requested chunk and its explicit dependencies in that file.
```

Build:

```text
$build-feature PK-009 from pokeatlas-feature-chunks.md. Use the approved plan and do not expand scope beyond the requested chunk and its explicit dependencies in that file.
```

Verify:

```text
$verify-feature PK-009 from pokeatlas-feature-chunks.md
```

Review:

```text
$review-feature PK-009 from pokeatlas-feature-chunks.md
```

### PK-010 Error And Empty States

Planning:

```text
$plan-feature PK-010 from pokeatlas-feature-chunks.md. Use only the requested chunk and its explicit dependencies in that file.
```

Build:

```text
$build-feature PK-010 from pokeatlas-feature-chunks.md. Use the approved plan and do not expand scope beyond the requested chunk and its explicit dependencies in that file.
```

Verify:

```text
$verify-feature PK-010 from pokeatlas-feature-chunks.md
```

Review:

```text
$review-feature PK-010 from pokeatlas-feature-chunks.md
```

### PK-011 Loading Experience

Planning:

```text
$plan-feature PK-011 from pokeatlas-feature-chunks.md. Use only the requested chunk and its explicit dependencies in that file.
```

Build:

```text
$build-feature PK-011 from pokeatlas-feature-chunks.md. Use the approved plan and do not expand scope beyond the requested chunk and its explicit dependencies in that file.
```

Verify:

```text
$verify-feature PK-011 from pokeatlas-feature-chunks.md
```

Review:

```text
$review-feature PK-011 from pokeatlas-feature-chunks.md
```

### PK-012 Product Visual System

Planning:

```text
$plan-feature PK-012 from pokeatlas-feature-chunks.md. Use only the requested chunk and its explicit dependencies in that file.
```

Build:

```text
$build-feature PK-012 from pokeatlas-feature-chunks.md. Use the approved plan and do not expand scope beyond the requested chunk and its explicit dependencies in that file.
```

Verify:

```text
$verify-feature PK-012 from pokeatlas-feature-chunks.md
```

Review:

```text
$review-feature PK-012 from pokeatlas-feature-chunks.md
```

### PK-013 Data Normalization Layer

Planning:

```text
$plan-feature PK-013 from pokeatlas-feature-chunks.md. Use only the requested chunk and its explicit dependencies in that file.
```

Build:

```text
$build-feature PK-013 from pokeatlas-feature-chunks.md. Use the approved plan and do not expand scope beyond the requested chunk and its explicit dependencies in that file.
```

Verify:

```text
$verify-feature PK-013 from pokeatlas-feature-chunks.md
```

Review:

```text
$review-feature PK-013 from pokeatlas-feature-chunks.md
```

### PK-014 Lightweight API Helpers

Build dependency note:
- build after `PK-003`, `PK-006`, and `PK-008`

Planning:

```text
$plan-feature PK-014 from pokeatlas-feature-chunks.md. Use only the requested chunk and its explicit dependencies in that file.
```

Build:

```text
$build-feature PK-014 from pokeatlas-feature-chunks.md. Use the approved plan and do not expand scope beyond the requested chunk and its explicit dependencies in that file.
```

Verify:

```text
$verify-feature PK-014 from pokeatlas-feature-chunks.md
```

Review:

```text
$review-feature PK-014 from pokeatlas-feature-chunks.md
```

### PK-015 State Persistence

Build dependency note:
- build after `PK-007` and `PK-008`

Planning:

```text
$plan-feature PK-015 from pokeatlas-feature-chunks.md. Use only the requested chunk and its explicit dependencies in that file.
```

Build:

```text
$build-feature PK-015 from pokeatlas-feature-chunks.md. Use the approved plan and do not expand scope beyond the requested chunk and its explicit dependencies in that file.
```

Verify:

```text
$verify-feature PK-015 from pokeatlas-feature-chunks.md
```

Review:

```text
$review-feature PK-015 from pokeatlas-feature-chunks.md
```

### PK-016 Accessibility And UX Hardening

Planning:

```text
$plan-feature PK-016 from pokeatlas-feature-chunks.md. Use only the requested chunk and its explicit dependencies in that file.
```

Build:

```text
$build-feature PK-016 from pokeatlas-feature-chunks.md. Use the approved plan and do not expand scope beyond the requested chunk and its explicit dependencies in that file.
```

Verify:

```text
$verify-feature PK-016 from pokeatlas-feature-chunks.md
```

Review:

```text
$review-feature PK-016 from pokeatlas-feature-chunks.md
```

## Minimal Benchmark Set

If you want a smaller stable benchmark set instead of running all chunks, use:

- `PK-012`
- `PK-013`
- `PK-001`
- `PK-002`
- `PK-004`
- `PK-005`
- `PK-008`
- `PK-009`
- `PK-010`

This smaller set still exercises:

- visual system work
- shared data modeling
- landing-page implementation
- list/search/detail flows
- modal routing pressure
- interactive client state
- metadata and sharing
- hardening and resilience
