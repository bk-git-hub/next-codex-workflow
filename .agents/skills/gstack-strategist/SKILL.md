---
name: gstack-strategist
description: Use when working on next-codex-workflow product strategy, feature planning, architecture changes, release planning, benchmark design, or when the user explicitly wants to use real gstack planning skills. This skill must spawn the gstack-strategist agent, which uses the original installed gstack skills rather than imitating them.
metadata:
  short-description: Spawn the gstack strategy wrapper agent
---

# gstack Strategist

This skill is a thin wrapper around the custom agent named `gstack-strategist`.

It is for maintaining `next-codex-workflow`.
It does not mean the product should embed `gstack` as a runtime dependency.

Workflow:
1. This skill requires multi-agent support.
2. Immediately spawn the agent named `gstack-strategist`.
3. Wait for it to finish.
4. Do not perform a gstack-style planning review in the parent session.
5. The spawned agent must use the original installed gstack skills:
   - `$office-hours`
   - `$plan-ceo-review`
   - `$plan-eng-review`
   - `$review` when relevant
6. If the agent cannot be spawned or the original gstack skills are unavailable, stop and say so clearly.

The goal is to use real gstack planning and review behavior first, then summarize what to do for this repository.
