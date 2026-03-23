import decisionTemplate from "../templates/artifacts/DECISION.md.hbs";
import fileSpecsTemplate from "../templates/artifacts/FILE_SPECS.md.hbs";
import planTemplate from "../templates/artifacts/PLAN.md.hbs";
import reviewTemplate from "../templates/artifacts/REVIEW.md.hbs";
import verifyTemplate from "../templates/artifacts/VERIFY.md.hbs";
import { renderTemplate } from "./render-template.js";
import type { GeneratedFile } from "./types.js";

export function generateArtifacts(): GeneratedFile[] {
  return [
    {
      relativePath: "agent-workflow/artifacts/PLAN.md",
      content: renderTemplate(planTemplate, {})
    },
    {
      relativePath: "agent-workflow/artifacts/FILE_SPECS.md",
      content: renderTemplate(fileSpecsTemplate, {})
    },
    {
      relativePath: "agent-workflow/artifacts/DECISION.md",
      content: renderTemplate(decisionTemplate, {})
    },
    {
      relativePath: "agent-workflow/artifacts/VERIFY.md",
      content: renderTemplate(verifyTemplate, {})
    },
    {
      relativePath: "agent-workflow/artifacts/REVIEW.md",
      content: renderTemplate(reviewTemplate, {})
    }
  ];
}
