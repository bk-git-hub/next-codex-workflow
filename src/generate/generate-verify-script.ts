import verificationSkillTemplate from "../templates/internal-skills/code-change-verification/SKILL.md.hbs";
import verifyReferenceTemplate from "../templates/internal-skills/code-change-verification/references/verify-template.md.hbs";
import verifyScriptTemplate from "../templates/internal-skills/code-change-verification/scripts/run-verify.mjs.hbs";
import rootVerifyScriptTemplate from "../templates/scripts/verify-agent-workflow.mjs.hbs";
import { renderTemplate } from "./render-template.js";
import type { GeneratedFile } from "./types.js";

export function generateVerifyScriptFiles(): GeneratedFile[] {
  return [
    {
      relativePath: ".agents/skills/code-change-verification/SKILL.md",
      content: renderTemplate(verificationSkillTemplate, {})
    },
    {
      relativePath: ".agents/skills/code-change-verification/references/verify-template.md",
      content: renderTemplate(verifyReferenceTemplate, {})
    },
    {
      relativePath: ".agents/skills/code-change-verification/scripts/run-verify.mjs",
      content: renderTemplate(verifyScriptTemplate, {})
    },
    {
      relativePath: "scripts/verify-agent-workflow.mjs",
      content: renderTemplate(rootVerifyScriptTemplate, {})
    }
  ];
}
