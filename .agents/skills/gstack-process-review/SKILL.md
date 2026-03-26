---
name: gstack-process-review
description: Use when working on next-codex-workflow product strategy, feature planning, architecture changes, release planning, benchmark design, or when the user mentions gstack, office-hours, plan-ceo-review, or plan-eng-review. Apply a gstack-inspired process review before implementation.
metadata:
  short-description: Apply gstack-style planning and review gates
---

# Gstack Process Review

This skill is for maintaining `next-codex-workflow`. It does not mean the product should embed `gstack` as a runtime dependency.

Before substantial work, read [../../../GSTACK_CHECKLIST.md](../../../GSTACK_CHECKLIST.md).

Use this process:
1. Restate the real problem, user value, and smallest wedge.
2. Challenge scope and alternatives like a `plan-ceo-review`.
3. Stress architecture, failure modes, compatibility, and tests like a `plan-eng-review`.
4. Confirm the proposal preserves this product's identity:
   - explicit artifacts
   - human approval at planning
   - specialist agents around a repo workflow
   - Next.js-focused quality layer
5. Only then proceed to implementation or recommendation.

When `gstack` is relevant, prefer borrowing ideas instead of infrastructure.

Safe to borrow:
- host-aware skill templating
- multi-host abstraction ideas
- metadata generation helpers
- Codex E2E and benchmark patterns
- stronger planning and review structures

Do not import by default:
- Bun-first runtime expectations
- browser binary and Playwright installation burden
- home-directory runtime roots
- symlink-heavy setup behavior

If helpful, inspect these reference files:
- [../../../tmp/gstack/README.md](../../../tmp/gstack/README.md)
- [../../../tmp/gstack/ARCHITECTURE.md](../../../tmp/gstack/ARCHITECTURE.md)

Before coding, produce a brief summary with:
- Problem
- Recommendation
- Risks
- Copy From gstack
- Keep Ours
- Postpone
