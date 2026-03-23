import changeReviewSkillTemplate from "../templates/internal-skills/change-review/SKILL.md.hbs";
import nextReviewChecklistTemplate from "../templates/internal-skills/change-review/references/nextjs-review-checklist.md.hbs";
import reactReviewChecklistTemplate from "../templates/internal-skills/change-review/references/react-review-checklist.md.hbs";
import buildFeatureSkillTemplate from "../templates/internal-skills/build-feature/SKILL.md.hbs";
import buildFeatureMetadataTemplate from "../templates/internal-skills/build-feature/agents/openai.yaml.hbs";
import decisionLogSkillTemplate from "../templates/internal-skills/decision-log/SKILL.md.hbs";
import decisionTemplate from "../templates/internal-skills/decision-log/references/decision-template.md.hbs";
import implementationStrategySkillTemplate from "../templates/internal-skills/implementation-strategy/SKILL.md.hbs";
import implementationStrategyMetadataTemplate from "../templates/internal-skills/implementation-strategy/agents/openai.yaml.hbs";
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
import type { GeneratedFile } from "./types.js";

export function generateInternalSkills(): GeneratedFile[] {
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
      relativePath: ".agents/skills/implementation-strategy/agents/openai.yaml",
      content: renderTemplate(implementationStrategyMetadataTemplate, {})
    },
    {
      relativePath: ".agents/skills/plan-feature/SKILL.md",
      content: renderTemplate(planFeatureSkillTemplate, {})
    },
    {
      relativePath: ".agents/skills/plan-feature/agents/openai.yaml",
      content: renderTemplate(planFeatureMetadataTemplate, {})
    },
    {
      relativePath: ".agents/skills/build-feature/SKILL.md",
      content: renderTemplate(buildFeatureSkillTemplate, {})
    },
    {
      relativePath: ".agents/skills/build-feature/agents/openai.yaml",
      content: renderTemplate(buildFeatureMetadataTemplate, {})
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
      content: renderTemplate(verifyFeatureSkillTemplate, {})
    },
    {
      relativePath: ".agents/skills/verify-feature/agents/openai.yaml",
      content: renderTemplate(verifyFeatureMetadataTemplate, {})
    },
    {
      relativePath: ".agents/skills/review-feature/SKILL.md",
      content: renderTemplate(reviewFeatureSkillTemplate, {})
    },
    {
      relativePath: ".agents/skills/review-feature/agents/openai.yaml",
      content: renderTemplate(reviewFeatureMetadataTemplate, {})
    }
  ];
}
