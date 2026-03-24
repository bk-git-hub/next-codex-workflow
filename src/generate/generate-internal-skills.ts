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
        "8. Stop before implementation code."
      ].join("\n"),
      planModeGuardrails: [
        "- Do not skip the explicit exploration pass before planning.",
        "- Keep all planning work in the parent session for this single-agent mode."
      ].join("\n"),
      planFeatureDefaultPrompt:
        "Use $plan-feature to inspect this repository, perform a read-only exploration pass in the current session, then create PLAN.md and FILE_SPECS.md directly without spawning subagents",
      buildModeWorkflow: [
        "3. This repository uses the single-agent workflow mode.",
        "4. Inspect the relevant vendored quality skills under `.agents/skills/`, especially `next-best-practices` and `vercel-react-best-practices`, before making implementation choices.",
        "5. Implement the approved plan directly in the current session.",
        "6. If multiple viable strategies remain, stop for user choice and append the decision to `DECISION.md`.",
        "7. Assess test impact in the current session, update focused tests, and prefer Playwright for async Server Component-heavy flows.",
        "8. Run deterministic verification in the current session and update `agent-workflow/artifacts/VERIFY.md`.",
        "9. Perform a structured review in the current session and update `agent-workflow/artifacts/REVIEW.md`."
      ].join("\n"),
      buildModeGuardrails: [
        "- Use the parent session for implementation, testing, verification, and review in this single-agent mode.",
        "- Keep verification and review as explicit closeout steps, not hidden work."
      ].join("\n"),
      buildFeatureShortDescription: "Implement the plan in one session with testing, verification, and review",
      buildFeatureDefaultPrompt:
        "Use $build-feature to implement the approved plan in PLAN.md directly in the current session, inspect the relevant repo-local quality skills under .agents/skills/, assess test impact and update tests, then update VERIFY.md and REVIEW.md without spawning subagents.",
      verifyModeWorkflow: [
        "1. This repository uses the single-agent workflow mode.",
        "2. Run the repository verification workflow in the current session.",
        "3. Update `agent-workflow/artifacts/VERIFY.md`.",
        "4. Report blocking and non-blocking failures clearly."
      ].join("\n"),
      verifyModeGuardrails: "- Keep verification in the current session for this single-agent mode.",
      verifyFeatureDefaultPrompt:
        "Use $verify-feature to run the repository verification workflow directly in the current session and update VERIFY.md.",
      reviewModeWorkflow: [
        "1. This repository uses the single-agent workflow mode.",
        "2. Perform the final review in the current session.",
        "3. Update `agent-workflow/artifacts/REVIEW.md`.",
        "4. Prioritize correctness, regressions, plan compliance, and missing tests."
      ].join("\n"),
      reviewModeGuardrails: "- Keep the final review in the current session for this single-agent mode.",
      reviewFeatureDefaultPrompt:
        "Use $review-feature to perform the final review directly in the current session and update REVIEW.md."
    };
  }

  return {
    planModeWorkflow: [
      "3. This skill requires Codex multi-agent. If multi-agent is unavailable, stop and tell the user to run `/multi-agent` and start a new Codex session before retrying.",
      "4. Spawn the agent named `explorer` now and delegate read-only repository exploration.",
      "5. Wait for the spawned `explorer` agent to finish.",
      "6. Spawn the agent named `planner` now and delegate the planning task together with the `explorer` findings.",
      "7. Wait for the spawned `planner` agent to finish.",
      "8. Have the `planner` agent create or update:",
      "   - `agent-workflow/artifacts/PLAN.md`",
      "   - `agent-workflow/artifacts/FILE_SPECS.md`",
      "9. Surface open decisions that need explicit user choice.",
      "10. Stop before implementation code."
    ].join("\n"),
    planModeGuardrails: [
      "- Do not let the `explorer` agent write repository files; it is read-only.",
      "- Do not create or update the planning artifacts in the parent session when the `planner` agent cannot be spawned; stop instead."
    ].join("\n"),
    planFeatureDefaultPrompt:
      "Use $plan-feature to inspect this repository, spawn the agent named explorer first for read-only repository analysis, then spawn the agent named planner to create PLAN.md and FILE_SPECS.md from that exploration brief, and stop with instructions to run /multi-agent and restart Codex if spawning is unavailable",
    buildModeWorkflow: [
      "3. This skill requires Codex multi-agent. If multi-agent is unavailable, stop and tell the user to run `/multi-agent` and start a new Codex session before retrying.",
      "4. Spawn the agent named `executor` now and delegate the approved implementation or refactor task.",
      "5. Tell the `executor` agent to read `PLAN.md`, `FILE_SPECS.md`, and `DECISION.md` if it exists before coding.",
      "6. Tell the `executor` agent to inspect the relevant vendored quality skills under `.agents/skills/`, especially `next-best-practices` and `vercel-react-best-practices`, before making implementation choices.",
      "7. Wait for the spawned `executor` agent to finish.",
      "8. If multiple viable strategies remain, stop for user choice and append the decision to `DECISION.md`.",
      "9. Spawn the agent named `tester` now and delegate test impact assessment, test updates, and test-focused checks.",
      "10. Tell the `tester` agent to inspect `.agents/skills/vitest` and `.agents/skills/playwright-best-practices`, use `.agents/skills/playwright-cli` when browser inspection is relevant, and prefer Playwright for async Server Component-heavy flows.",
      "11. Wait for the spawned `tester` agent to finish.",
      "12. Spawn the agent named `verifier` and wait for it to update `agent-workflow/artifacts/VERIFY.md`.",
      "13. Spawn the agent named `reviewer` and wait for it to update `agent-workflow/artifacts/REVIEW.md`."
    ].join("\n"),
    buildModeGuardrails: [
      "- Do not implement application code in the parent session when the `executor` agent cannot be spawned; stop instead.",
      "- Do not write or update tests in the parent session when the `tester` agent cannot be spawned; stop instead.",
      "- Keep verification and review as separate spawned closeout steps, not hidden work."
    ].join("\n"),
    buildFeatureShortDescription: "Implement the plan through executor, tester, verifier, and reviewer",
    buildFeatureDefaultPrompt:
      "Use $build-feature to implement the approved plan in PLAN.md by spawning the agent named executor immediately, then spawn the agent named tester to choose the right test layer and update tests, then spawn verifier and reviewer. Tell executor and tester to use the relevant repo-local quality skills under .agents/skills/, and stop if executor or tester spawning is unavailable.",
    verifyModeWorkflow: [
      "1. This skill requires Codex multi-agent. If multi-agent is unavailable, stop and tell the user to run `/multi-agent` and start a new Codex session before retrying.",
      "2. Spawn the agent named `verifier` now and delegate the repository verification workflow.",
      "3. Wait for the spawned `verifier` agent to finish.",
      "4. Have the `verifier` agent update `agent-workflow/artifacts/VERIFY.md`.",
      "5. Report blocking and non-blocking failures clearly."
    ].join("\n"),
    verifyModeGuardrails:
      "- Do not run verification in the parent session when the `verifier` agent cannot be spawned; stop instead.",
    verifyFeatureDefaultPrompt:
      "Use $verify-feature to spawn the agent named verifier, wait for it to run the repository verification workflow, and stop with instructions to run /multi-agent and restart Codex if spawning is unavailable.",
    reviewModeWorkflow: [
      "1. This skill requires Codex multi-agent. If multi-agent is unavailable, stop and tell the user to run `/multi-agent` and start a new Codex session before retrying.",
      "2. Spawn the agent named `reviewer` now and delegate the final review.",
      "3. Wait for the spawned `reviewer` agent to finish.",
      "4. Have the `reviewer` agent update `agent-workflow/artifacts/REVIEW.md`.",
      "5. Prioritize correctness, regressions, plan compliance, and missing tests."
    ].join("\n"),
    reviewModeGuardrails:
      "- Do not perform the review in the parent session when the `reviewer` agent cannot be spawned; stop instead.",
    reviewFeatureDefaultPrompt:
      "Use $review-feature to spawn the agent named reviewer, wait for it to complete the final review, and stop with instructions to run /multi-agent and restart Codex if spawning is unavailable."
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
