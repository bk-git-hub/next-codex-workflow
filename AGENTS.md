# next-codex-workflow Agent Guide

This repository uses `gstack` as a development coprocess, not as a shipped runtime dependency.

Before any substantial work in this repository, you must apply the gstack process review.

A task is substantial when it changes one or more of these:
- product direction or scope
- agent model or workflow order
- skill generation or host abstraction
- install or update behavior
- benchmarking, evals, or smoke-test strategy
- release policy or testing architecture

Required workflow for substantial work:
1. Invoke `$gstack-strategist` first.
2. `$gstack-strategist` must use the original installed `gstack` skills, in order, when relevant:
   - `$office-hours`
   - `$plan-ceo-review`
   - `$plan-eng-review`
   - `$review`
3. If the original `gstack` skills are unavailable in the current session, fall back to `$gstack-process-review`. If that is also unavailable, follow [GSTACK_CHECKLIST.md](GSTACK_CHECKLIST.md) manually.
2. Complete these gates before implementation:
   - Office-hours framing: restate the real problem, user value, and smallest useful wedge.
   - CEO review: challenge scope, alternatives, risks, and success metric.
   - Engineering review: define architecture, failure modes, migration impact, and tests.
   - Pre-ship review: confirm the proposal still fits this product's identity.
4. Summarize the review outcome briefly before coding.
5. Do not treat `gstack` as a default runtime dependency or installer requirement for `next-codex-workflow` unless the user explicitly asks for that direction.

Preserve these product guardrails:
- explicit artifacts
- human approval at planning
- specialist agents around a repo workflow
- Next.js-focused quality layer

Prefer copying ideas, not infrastructure:
- okay to borrow: host-aware skill templating, multi-host abstraction, metadata generation helpers, Codex E2E tests, stronger planning and review patterns
- do not import by default: Bun-first runtime, browser binary and Playwright install burden, home-directory runtime roots, symlink-heavy install behavior

For small, local, low-risk tasks, you may skip the full gstack process review, but say so briefly and explain why.
