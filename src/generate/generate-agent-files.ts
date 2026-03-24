import executorTemplate from "../templates/codex/agents/executor.toml.hbs";
import plannerTemplate from "../templates/codex/agents/planner.toml.hbs";
import reviewerTemplate from "../templates/codex/agents/reviewer.toml.hbs";
import testerTemplate from "../templates/codex/agents/tester.toml.hbs";
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
      relativePath: ".codex/agents/executor.toml",
      content: renderTemplate(executorTemplate, {})
    },
    {
      relativePath: ".codex/agents/tester.toml",
      content: renderTemplate(testerTemplate, {})
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
