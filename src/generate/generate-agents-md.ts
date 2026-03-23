import agentsTemplate from "../templates/AGENTS.md.hbs";
import { formatScriptCommand } from "./format-script-command.js";
import { renderTemplate } from "./render-template.js";
import type { GenerationContext, GeneratedFile } from "./types.js";

function formatSourceRoots(context: GenerationContext): string {
  const roots = [...context.inspection.router.appPaths, ...context.inspection.router.pagesPaths];
  return roots.map((root) => `- \`${root}/\``).join("\n");
}

function formatCommands(context: GenerationContext): string {
  const packageManager = context.inspection.packageManager.packageManager;
  const commands = [
    context.inspection.scripts.dev ? `- Dev: \`${formatScriptCommand(packageManager, "dev")}\`` : null,
    context.inspection.scripts.build ? `- Build: \`${formatScriptCommand(packageManager, "build")}\`` : null,
    context.inspection.scripts.lint ? `- Lint: \`${formatScriptCommand(packageManager, "lint")}\`` : null,
    context.inspection.scripts.test ? `- Test: \`${formatScriptCommand(packageManager, "test")}\`` : null,
    context.inspection.scripts.typecheck
      ? `- Typecheck: \`${formatScriptCommand(packageManager, "typecheck")}\``
      : null,
    context.options.performance ? "- Performance audit: `node scripts/run-lighthouse.mjs`" : null
  ].filter((value): value is string => value !== null);

  return commands.join("\n");
}

function formatRouterStyle(context: GenerationContext): string {
  if (context.inspection.router.appRouter && context.inspection.router.pagesRouter) {
    return "App Router and Pages Router";
  }

  return context.inspection.router.appRouter ? "App Router" : "Pages Router";
}

export function generateAgentsMd(context: GenerationContext): GeneratedFile {
  const workflowArtifacts = [
    "- `agent-workflow/artifacts/PLAN.md`",
    "- `agent-workflow/artifacts/FILE_SPECS.md`",
    "- `agent-workflow/artifacts/DECISION.md`",
    "- `agent-workflow/artifacts/VERIFY.md`",
    "- `agent-workflow/artifacts/REVIEW.md`"
  ];

  if (context.options.performance) {
    workflowArtifacts.push("- `agent-workflow/artifacts/PERF.md`");
  }

  const performanceRule = context.options.performance
    ? "7. If performance mode is enabled and user-facing routes changed, run performance audit and update `PERF.md`.\n8. Final summaries must reference workflow artifact outputs."
    : "7. Final summaries must reference workflow artifact outputs.";

  return {
    relativePath: "AGENTS.md",
    content: renderTemplate(agentsTemplate, {
      routerStyle: formatRouterStyle(context),
      sourceRoots: formatSourceRoots(context),
      commands: formatCommands(context),
      workflowArtifacts: workflowArtifacts.join("\n"),
      performanceRule
    })
  };
}
