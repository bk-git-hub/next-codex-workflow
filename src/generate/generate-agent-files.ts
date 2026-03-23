import plannerTemplate from "../templates/codex/agents/planner.toml.hbs";
import reviewerTemplate from "../templates/codex/agents/reviewer.toml.hbs";
import verifierTemplate from "../templates/codex/agents/verifier.toml.hbs";
import { renderTemplate } from "./render-template.js";
import type { GeneratedFile } from "./types.js";

export function generateAgentFiles(): GeneratedFile[] {
  return [
    {
      relativePath: ".codex/agents/planner.toml",
      content: renderTemplate(plannerTemplate, {})
    },
    {
      relativePath: ".codex/agents/reviewer.toml",
      content: renderTemplate(reviewerTemplate, {})
    },
    {
      relativePath: ".codex/agents/verifier.toml",
      content: renderTemplate(verifierTemplate, {})
    }
  ];
}
