import changeReviewSkillTemplate from "../templates/internal-skills/change-review/SKILL.md.hbs";
import nextReviewChecklistTemplate from "../templates/internal-skills/change-review/references/nextjs-review-checklist.md.hbs";
import reactReviewChecklistTemplate from "../templates/internal-skills/change-review/references/react-review-checklist.md.hbs";
import buildFeatureSkillTemplate from "../templates/internal-skills/build-feature/SKILL.md.hbs";
import buildFeatureMetadataTemplate from "../templates/internal-skills/build-feature/agents/openai.yaml.hbs";
import decisionLogSkillTemplate from "../templates/internal-skills/decision-log/SKILL.md.hbs";
import decisionTemplate from "../templates/internal-skills/decision-log/references/decision-template.md.hbs";
import implementationStrategySkillTemplate from "../templates/internal-skills/implementation-strategy/SKILL.md.hbs";
import fileSpecTemplate from "../templates/internal-skills/implementation-strategy/references/file-spec-template.md.hbs";
import planTemplate from "../templates/internal-skills/implementation-strategy/references/plan-template.md.hbs";
import planFeatureSkillTemplate from "../templates/internal-skills/plan-feature/SKILL.md.hbs";
import planFeatureMetadataTemplate from "../templates/internal-skills/plan-feature/agents/openai.yaml.hbs";
import repoExplorationSkillTemplate from "../templates/internal-skills/repo-exploration/SKILL.md.hbs";
import explorationChecklistTemplate from "../templates/internal-skills/repo-exploration/references/exploration-checklist.md.hbs";
import reviewFeatureSkillTemplate from "../templates/internal-skills/review-feature/SKILL.md.hbs";
import reviewFeatureMetadataTemplate from "../templates/internal-skills/review-feature/agents/openai.yaml.hbs";
import taskClarificationSkillTemplate from "../templates/internal-skills/task-clarification/SKILL.md.hbs";
import clarificationTemplate from "../templates/internal-skills/task-clarification/references/clarification-template.md.hbs";
import verifyFeatureSkillTemplate from "../templates/internal-skills/verify-feature/SKILL.md.hbs";
import verifyFeatureMetadataTemplate from "../templates/internal-skills/verify-feature/agents/openai.yaml.hbs";
import { renderTemplate } from "./render-template.js";
import type { GenerationContext, GeneratedFile } from "./types.js";

function createModeTemplateValues(context: GenerationContext): Record<string, string> {
  const planAutoCommitStep = context.options.autoCommit
    ? "9. If automatic workflow commits are enabled, inspect `git status --short` and create one commit with the prefix `plan:` after confirming the changes are limited to planning-stage artifacts and repo-managed workflow files touched by this step. If there are no relevant changes or unrelated pre-existing changes are present, skip the commit and report why."
    : "";
  const buildAutoCommitStep = context.options.autoCommit
    ? "10. If automatic workflow commits are enabled, inspect `git status --short` and create one commit with the prefix `build:` after confirming the changes belong to this implementation pass. If there are no relevant changes or unrelated pre-existing changes are present, skip the commit and report why."
    : "";
  const verifyAutoCommitStep = context.options.autoCommit
    ? "5. If automatic workflow commits are enabled, inspect `git status --short` and create one commit with the prefix `verify:` after confirming the changes are limited to verification outputs from this step. If there are no relevant changes or unrelated pre-existing changes are present, skip the commit and report why."
    : "";
  const reviewAutoCommitStep = context.options.autoCommit
    ? "5. If automatic workflow commits are enabled, inspect `git status --short` and create one commit with the prefix `review:` after confirming the changes are limited to review outputs from this step. If there are no relevant changes or unrelated pre-existing changes are present, skip the commit and report why."
    : "";
  const autoCommitGuardrail = context.options.autoCommit
    ? "- When automatic workflow commits are enabled, never include unrelated pre-existing changes in the commit. Skip the commit and report the blocking files instead."
    : "";

  if (context.options.workflowMode === "single-agent") {
    return {
      planModeWorkflow: [
        "3. This repository uses the single-agent workflow mode.",
        "4. Inspect the relevant vendored quality skills under `.agents/skills/` before writing the plan.",
        "5. Perform the repository exploration in the current session and capture the relevant patterns, affected flows, and constraints before planning.",
        "6. Create or update:",
        "   - `agent-workflow/artifacts/PLAN.md`",
        "   - `agent-workflow/artifacts/FILE_SPECS.md`",
        "7. Surface open decisions that need explicit user choice.",
        "8. Stop before implementation code.",
        planAutoCommitStep
      ].filter(Boolean).join("\n"),
      planModeGuardrails: [
        "- Do not skip the explicit exploration pass before planning.",
        "- Keep all planning work in the parent session for this single-agent mode.",
        autoCommitGuardrail
      ].filter(Boolean).join("\n"),
      planFeatureDefaultPrompt: context.options.autoCommit
        ? "Use $plan-feature to inspect this repository, perform a read-only exploration pass in the current session, then create PLAN.md and FILE_SPECS.md directly without spawning subagents. If the tree is safe, create a stage-scoped commit using the prefix `plan:` and report when auto-commit is skipped."
        : "Use $plan-feature to inspect this repository, perform a read-only exploration pass in the current session, then create PLAN.md and FILE_SPECS.md directly without spawning subagents",
      buildModeWorkflow: [
        "3. This repository uses the single-agent workflow mode.",
        "4. Inspect the relevant vendored quality skills under `.agents/skills/`, especially `next-best-practices` and `vercel-react-best-practices`, before making implementation choices.",
        "5. Implement the approved plan directly in the current session.",
        "6. If multiple viable strategies remain, stop for user choice and append the decision to `DECISION.md`.",
        "7. Assess test impact in the current session, update focused tests, and prefer Playwright for async Server Component-heavy flows.",
        "8. Run deterministic verification in the current session and update `agent-workflow/artifacts/VERIFY.md`.",
        "9. Perform a structured review in the current session and update `agent-workflow/artifacts/REVIEW.md`.",
        buildAutoCommitStep
      ].filter(Boolean).join("\n"),
      buildModeGuardrails: [
        "- Use the parent session for implementation, testing, verification, and review in this single-agent mode.",
        "- Keep verification and review as explicit closeout steps, not hidden work.",
        autoCommitGuardrail
      ].filter(Boolean).join("\n"),
      buildFeatureShortDescription: "Implement the plan in one session with testing, verification, and review",
      buildFeatureDefaultPrompt: context.options.autoCommit
        ? "Use $build-feature to implement the approved plan in PLAN.md directly in the current session, inspect the relevant repo-local quality skills under .agents/skills/, assess test impact and update tests, then update VERIFY.md and REVIEW.md without spawning subagents. If the tree is safe, create a stage-scoped commit using the prefix `build:` and report when auto-commit is skipped."
        : "Use $build-feature to implement the approved plan in PLAN.md directly in the current session, inspect the relevant repo-local quality skills under .agents/skills/, assess test impact and update tests, then update VERIFY.md and REVIEW.md without spawning subagents.",
      verifyModeWorkflow: [
        "1. This repository uses the single-agent workflow mode.",
        "2. Run the repository verification workflow in the current session.",
        "3. Update `agent-workflow/artifacts/VERIFY.md`.",
        "4. Report blocking and non-blocking failures clearly.",
        verifyAutoCommitStep
      ].filter(Boolean).join("\n"),
      verifyModeGuardrails: `- Keep verification in the current session for this single-agent mode.\n${autoCommitGuardrail}`.trim(),
      verifyFeatureDefaultPrompt: context.options.autoCommit
        ? "Use $verify-feature to run the repository verification workflow directly in the current session, update VERIFY.md, and create a safe verification commit using the prefix `verify:` when the tree is scoped to this step."
        : "Use $verify-feature to run the repository verification workflow directly in the current session and update VERIFY.md.",
      reviewModeWorkflow: [
        "1. This repository uses the single-agent workflow mode.",
        "2. Perform the final review in the current session.",
        "3. Update `agent-workflow/artifacts/REVIEW.md`.",
        "4. Prioritize correctness, regressions, plan compliance, and missing tests.",
        reviewAutoCommitStep
      ].filter(Boolean).join("\n"),
      reviewModeGuardrails: `- Keep the final review in the current session for this single-agent mode.\n${autoCommitGuardrail}`.trim(),
      reviewFeatureDefaultPrompt: context.options.autoCommit
        ? "Use $review-feature to perform the final review directly in the current session, update REVIEW.md, and create a safe review commit using the prefix `review:` when the tree is scoped to this step."
        : "Use $review-feature to perform the final review directly in the current session and update REVIEW.md."
    };
  }

  return {
    planModeWorkflow: [
      "3. This skill requires Codex multi-agent. If multi-agent is unavailable, stop and tell the user to run `/multi-agent` and start a new Codex session before retrying.",
      "4. Spawn the agent named `explorer` now and delegate read-only repository exploration.",
      "5. Wait for the spawned `explorer` agent to finish.",
      "6. Integrate the `explorer` findings into a concise handoff note, then close the `explorer` agent once its result is captured.",
      "7. Spawn the agent named `planner` now and delegate the planning task together with the `explorer` findings.",
      "8. Wait for the spawned `planner` agent to finish.",
      "9. Have the `planner` agent create or update:",
      "   - `agent-workflow/artifacts/PLAN.md`",
      "   - `agent-workflow/artifacts/FILE_SPECS.md`",
      "10. Integrate the `planner` result, then close the `planner` agent once the artifacts are updated.",
      "11. Surface open decisions that need explicit user choice.",
      "12. Stop before implementation code.",
      context.options.autoCommit
        ? "13. If automatic workflow commits are enabled, inspect `git status --short` and create one commit with the prefix `plan:` after confirming the changes are limited to planning-stage artifacts and repo-managed workflow files touched by this step. If there are no relevant changes or unrelated pre-existing changes are present, skip the commit and report why."
        : ""
      ].filter(Boolean).join("\n"),
    planModeGuardrails: [
      "- Do not let the `explorer` agent write repository files; it is read-only.",
      "- Do not create or update the planning artifacts in the parent session when the `planner` agent cannot be spawned; stop instead.",
      "- Close spawned planning agents after their results are integrated so the session does not accumulate stale agent threads.",
      autoCommitGuardrail
      ].filter(Boolean).join("\n"),
    planFeatureDefaultPrompt: context.options.autoCommit
      ? "Use $plan-feature to inspect this repository, spawn the agent named explorer first for read-only repository analysis, close explorer after capturing its summary, then spawn the agent named planner to create PLAN.md and FILE_SPECS.md from that exploration brief, close planner once the artifacts are updated, and if the tree is safe create a stage-scoped commit using the prefix `plan:`. Stop with instructions to run /multi-agent and restart Codex if spawning is unavailable."
      : "Use $plan-feature to inspect this repository, spawn the agent named explorer first for read-only repository analysis, close explorer after capturing its summary, then spawn the agent named planner to create PLAN.md and FILE_SPECS.md from that exploration brief, close planner once the artifacts are updated, and stop with instructions to run /multi-agent and restart Codex if spawning is unavailable",
    buildModeWorkflow: [
      "3. This skill requires Codex multi-agent. If multi-agent is unavailable, stop and tell the user to run `/multi-agent` and start a new Codex session before retrying.",
      "4. Spawn the agent named `executor` now and delegate the approved implementation or refactor task.",
      "5. Tell the `executor` agent to read `PLAN.md`, `FILE_SPECS.md`, and `DECISION.md` if it exists before coding.",
      "6. Tell the `executor` agent to inspect the relevant vendored quality skills under `.agents/skills/`, especially `next-best-practices` and `vercel-react-best-practices`, before making implementation choices.",
      "7. Wait for the spawned `executor` agent to finish.",
      "8. Integrate the `executor` result, then close the `executor` agent once its work is captured.",
      "9. If multiple viable strategies remain, stop for user choice and append the decision to `DECISION.md`.",
      "10. Spawn the agent named `tester` now and delegate test impact assessment, test updates, and test-focused checks.",
      "11. Tell the `tester` agent to inspect `.agents/skills/vitest` and `.agents/skills/playwright-best-practices`, use `.agents/skills/playwright-cli` when browser inspection is relevant, and prefer Playwright for async Server Component-heavy flows.",
      "12. Wait for the spawned `tester` agent to finish.",
      "13. Integrate the `tester` result, then close the `tester` agent once test updates and findings are captured.",
      "14. Spawn the agent named `verifier` and wait for it to update `agent-workflow/artifacts/VERIFY.md`.",
      "15. Close the `verifier` agent once `VERIFY.md` is updated.",
      "16. Spawn the agent named `reviewer` and wait for it to update `agent-workflow/artifacts/REVIEW.md`.",
      "17. Close the `reviewer` agent once `REVIEW.md` is updated.",
      context.options.autoCommit
        ? "18. If automatic workflow commits are enabled, inspect `git status --short` and create one commit with the prefix `build:` after confirming the changes belong to this implementation pass. If there are no relevant changes or unrelated pre-existing changes are present, skip the commit and report why."
        : ""
    ].filter(Boolean).join("\n"),
    buildModeGuardrails: [
      "- Do not implement application code in the parent session when the `executor` agent cannot be spawned; stop instead.",
      "- Do not write or update tests in the parent session when the `tester` agent cannot be spawned; stop instead.",
      "- Keep verification and review as separate spawned closeout steps, not hidden work.",
      "- Close each spawned closeout agent after its artifact is updated so repeated feature loops do not exhaust subagent slots.",
      autoCommitGuardrail
    ].filter(Boolean).join("\n"),
    buildFeatureShortDescription: "Implement the plan through executor, tester, verifier, and reviewer",
    buildFeatureDefaultPrompt: context.options.autoCommit
      ? "Use $build-feature to implement the approved plan in PLAN.md by spawning the agent named executor immediately, close executor after integrating its implementation summary, then spawn the agent named tester to choose the right test layer and update tests, close tester after integrating its test summary, then spawn verifier and reviewer and close each one after its artifact is updated. Tell executor and tester to use the relevant repo-local quality skills under .agents/skills/, and if the tree is safe create a stage-scoped commit using the prefix `build:`. Stop if executor or tester spawning is unavailable."
      : "Use $build-feature to implement the approved plan in PLAN.md by spawning the agent named executor immediately, close executor after integrating its implementation summary, then spawn the agent named tester to choose the right test layer and update tests, close tester after integrating its test summary, then spawn verifier and reviewer and close each one after its artifact is updated. Tell executor and tester to use the relevant repo-local quality skills under .agents/skills/, and stop if executor or tester spawning is unavailable.",
    verifyModeWorkflow: [
      "1. This skill requires Codex multi-agent. If multi-agent is unavailable, stop and tell the user to run `/multi-agent` and start a new Codex session before retrying.",
      "2. Spawn the agent named `verifier` now and delegate the repository verification workflow.",
      "3. Wait for the spawned `verifier` agent to finish.",
      "4. Have the `verifier` agent update `agent-workflow/artifacts/VERIFY.md`.",
      "5. Close the `verifier` agent once `VERIFY.md` is updated.",
      "6. Report blocking and non-blocking failures clearly.",
      context.options.autoCommit
        ? "7. If automatic workflow commits are enabled, inspect `git status --short` and create one commit with the prefix `verify:` after confirming the changes are limited to verification outputs from this step. If there are no relevant changes or unrelated pre-existing changes are present, skip the commit and report why."
        : ""
    ].filter(Boolean).join("\n"),
    verifyModeGuardrails: [
      "- Do not run verification in the parent session when the `verifier` agent cannot be spawned; stop instead.",
      "- Close the spawned `verifier` agent after its result is integrated.",
      autoCommitGuardrail
    ].filter(Boolean).join("\n"),
    verifyFeatureDefaultPrompt: context.options.autoCommit
      ? "Use $verify-feature to spawn the agent named verifier, wait for it to run the repository verification workflow, close it once VERIFY.md is updated, and create a safe verification commit using the prefix `verify:` when the tree is scoped to this step. Stop with instructions to run /multi-agent and restart Codex if spawning is unavailable."
      : "Use $verify-feature to spawn the agent named verifier, wait for it to run the repository verification workflow, close it once VERIFY.md is updated, and stop with instructions to run /multi-agent and restart Codex if spawning is unavailable.",
    reviewModeWorkflow: [
      "1. This skill requires Codex multi-agent. If multi-agent is unavailable, stop and tell the user to run `/multi-agent` and start a new Codex session before retrying.",
      "2. Spawn the agent named `reviewer` now and delegate the final review.",
      "3. Wait for the spawned `reviewer` agent to finish.",
      "4. Have the `reviewer` agent update `agent-workflow/artifacts/REVIEW.md`.",
      "5. Close the `reviewer` agent once `REVIEW.md` is updated.",
      "6. Prioritize correctness, regressions, plan compliance, and missing tests.",
      context.options.autoCommit
        ? "7. If automatic workflow commits are enabled, inspect `git status --short` and create one commit with the prefix `review:` after confirming the changes are limited to review outputs from this step. If there are no relevant changes or unrelated pre-existing changes are present, skip the commit and report why."
        : ""
    ].filter(Boolean).join("\n"),
    reviewModeGuardrails: [
      "- Do not perform the review in the parent session when the `reviewer` agent cannot be spawned; stop instead.",
      "- Close the spawned `reviewer` agent after its result is integrated.",
      autoCommitGuardrail
    ].filter(Boolean).join("\n"),
    reviewFeatureDefaultPrompt: context.options.autoCommit
      ? "Use $review-feature to spawn the agent named reviewer, wait for it to complete the final review, close it once REVIEW.md is updated, and create a safe review commit using the prefix `review:` when the tree is scoped to this step. Stop with instructions to run /multi-agent and restart Codex if spawning is unavailable."
      : "Use $review-feature to spawn the agent named reviewer, wait for it to complete the final review, close it once REVIEW.md is updated, and stop with instructions to run /multi-agent and restart Codex if spawning is unavailable."
  };
}

export function generateInternalSkills(context: GenerationContext): GeneratedFile[] {
  const modeValues = createModeTemplateValues(context);

  return [
    {
      relativePath: ".agents/skills/task-clarification/SKILL.md",
      content: renderTemplate(taskClarificationSkillTemplate, {})
    },
    {
      relativePath: ".agents/skills/task-clarification/references/clarification-template.md",
      content: renderTemplate(clarificationTemplate, {})
    },
    {
      relativePath: ".agents/skills/repo-exploration/SKILL.md",
      content: renderTemplate(repoExplorationSkillTemplate, {})
    },
    {
      relativePath: ".agents/skills/repo-exploration/references/exploration-checklist.md",
      content: renderTemplate(explorationChecklistTemplate, {})
    },
    {
      relativePath: ".agents/skills/implementation-strategy/SKILL.md",
      content: renderTemplate(implementationStrategySkillTemplate, {})
    },
    {
      relativePath: ".agents/skills/implementation-strategy/references/plan-template.md",
      content: renderTemplate(planTemplate, {})
    },
    {
      relativePath: ".agents/skills/implementation-strategy/references/file-spec-template.md",
      content: renderTemplate(fileSpecTemplate, {})
    },
    {
      relativePath: ".agents/skills/plan-feature/SKILL.md",
      content: renderTemplate(planFeatureSkillTemplate, modeValues)
    },
    {
      relativePath: ".agents/skills/plan-feature/agents/openai.yaml",
      content: renderTemplate(planFeatureMetadataTemplate, modeValues)
    },
    {
      relativePath: ".agents/skills/build-feature/SKILL.md",
      content: renderTemplate(buildFeatureSkillTemplate, modeValues)
    },
    {
      relativePath: ".agents/skills/build-feature/agents/openai.yaml",
      content: renderTemplate(buildFeatureMetadataTemplate, modeValues)
    },
    {
      relativePath: ".agents/skills/decision-log/SKILL.md",
      content: renderTemplate(decisionLogSkillTemplate, {})
    },
    {
      relativePath: ".agents/skills/decision-log/references/decision-template.md",
      content: renderTemplate(decisionTemplate, {})
    },
    {
      relativePath: ".agents/skills/change-review/SKILL.md",
      content: renderTemplate(changeReviewSkillTemplate, {})
    },
    {
      relativePath: ".agents/skills/change-review/references/nextjs-review-checklist.md",
      content: renderTemplate(nextReviewChecklistTemplate, {})
    },
    {
      relativePath: ".agents/skills/change-review/references/react-review-checklist.md",
      content: renderTemplate(reactReviewChecklistTemplate, {})
    },
    {
      relativePath: ".agents/skills/verify-feature/SKILL.md",
      content: renderTemplate(verifyFeatureSkillTemplate, modeValues)
    },
    {
      relativePath: ".agents/skills/verify-feature/agents/openai.yaml",
      content: renderTemplate(verifyFeatureMetadataTemplate, modeValues)
    },
    {
      relativePath: ".agents/skills/review-feature/SKILL.md",
      content: renderTemplate(reviewFeatureSkillTemplate, modeValues)
    },
    {
      relativePath: ".agents/skills/review-feature/agents/openai.yaml",
      content: renderTemplate(reviewFeatureMetadataTemplate, modeValues)
    }
  ];
}
