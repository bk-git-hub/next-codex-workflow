import perfArtifactTemplate from "../templates/artifacts/PERF.md.hbs";
import perfSkillTemplate from "../templates/internal-skills/performance-lighthouse-audit/SKILL.md.hbs";
import perfBudgetsTemplate from "../templates/internal-skills/performance-lighthouse-audit/references/budgets-template.json.hbs";
import perfReferenceTemplate from "../templates/internal-skills/performance-lighthouse-audit/references/perf-template.md.hbs";
import perfWrapperTemplate from "../templates/internal-skills/performance-lighthouse-audit/scripts/run-lighthouse.mjs.hbs";
import lighthouseConfigTemplate from "../templates/performance/lighthouserc.cjs.hbs";
import lighthouseScriptTemplate from "../templates/scripts/run-lighthouse.mjs.hbs";
import { formatScriptCommand } from "./format-script-command.js";
import { renderTemplate } from "./render-template.js";
import type { GenerationContext, GeneratedFile } from "./types.js";

export function resolvePerformanceRoutes(context: GenerationContext): string[] {
  if (context.options.routes.length > 0) {
    return context.options.routes;
  }

  if (context.inspection.performance.discoveredRoutes.length > 0) {
    return context.inspection.performance.discoveredRoutes;
  }

  return ["/"];
}

export function generatePerformanceFiles(context: GenerationContext): GeneratedFile[] {
  const routes = resolvePerformanceRoutes(context);
  const routesLiteral = JSON.stringify(routes, null, 2);
  const packageManager = context.inspection.packageManager.packageManager;
  const buildCommand = context.inspection.scripts.build
    ? formatScriptCommand(packageManager, "build")
    : "not-configured";
  const startCommand = context.inspection.scripts.start
    ? formatScriptCommand(packageManager, "start")
    : context.inspection.scripts.dev
      ? formatScriptCommand(packageManager, "dev")
      : "not-configured";

  return [
    {
      relativePath: ".agents/skills/performance-lighthouse-audit/SKILL.md",
      content: renderTemplate(perfSkillTemplate, {})
    },
    {
      relativePath: ".agents/skills/performance-lighthouse-audit/references/perf-template.md",
      content: renderTemplate(perfReferenceTemplate, {})
    },
    {
      relativePath: ".agents/skills/performance-lighthouse-audit/references/budgets-template.json",
      content: renderTemplate(perfBudgetsTemplate, {})
    },
    {
      relativePath: ".agents/skills/performance-lighthouse-audit/scripts/run-lighthouse.mjs",
      content: renderTemplate(perfWrapperTemplate, {})
    },
    {
      relativePath: "scripts/run-lighthouse.mjs",
      content: renderTemplate(lighthouseScriptTemplate, {
        routes: routesLiteral
      })
    },
    {
      relativePath: "agent-workflow/config/lighthouserc.cjs",
      content: renderTemplate(lighthouseConfigTemplate, {
        routes: routesLiteral,
        buildCommand,
        startCommand
      })
    },
    {
      relativePath: "agent-workflow/config/budgets.json",
      content: renderTemplate(perfBudgetsTemplate, {})
    },
    {
      relativePath: "agent-workflow/artifacts/PERF.md",
      content: renderTemplate(perfArtifactTemplate, {})
    }
  ];
}
