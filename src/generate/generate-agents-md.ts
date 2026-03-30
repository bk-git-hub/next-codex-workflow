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
    ? "9. If performance mode is enabled and user-facing routes changed, run performance audit and update `PERF.md`.\n10. Final summaries must reference workflow artifact outputs."
    : "9. Final summaries must reference workflow artifact outputs.";
  const autoCommitRule = context.options.autoCommit
    ? "When a workflow shortcut finishes with scoped changes and no unrelated pre-existing changes are mixed in, create a commit using the matching stage prefix: `plan:`, `build:`, `verify:`, or `review:`. If the tree is unsafe, skip the commit and report why."
    : "Automatic workflow commits are disabled unless the install was configured to enable them.";

  const isMultiAgent = context.options.workflowMode === "multi-agent";

  return {
    relativePath: "AGENTS.md",
    content: renderTemplate(agentsTemplate, {
      routerStyle: formatRouterStyle(context),
      sourceRoots: formatSourceRoots(context),
      commands: formatCommands(context),
      workflowArtifacts: workflowArtifacts.join("\n"),
      performanceRule,
      autoCommitLabel: context.options.autoCommit ? "enabled" : "disabled",
      autoCommitRule,
      workflowModeLabel: isMultiAgent ? "multi-agent" : "single-agent",
      planShortcutDescription: isMultiAgent
        ? "route work through `explorer` then `planner` before coding."
        : "inspect the repo, explore the current codebase, and write `PLAN.md` plus `FILE_SPECS.md` in the current session before coding.",
      buildShortcutDescription: isMultiAgent
        ? "route approved implementation or refactor work through `executor`, `tester`, then verification and review."
        : "implement the approved plan, update tests, and complete verification plus review in the current session.",
      verifyShortcutDescription: isMultiAgent
        ? "run verification through `verifier` and update `VERIFY.md`."
        : "run verification in the current session and update `VERIFY.md`.",
      reviewShortcutDescription: isMultiAgent
        ? "run final review through `reviewer` and update `REVIEW.md`."
        : "run final review in the current session and update `REVIEW.md`.",
      planningRoutingRule: isMultiAgent
        ? "Route non-trivial planning through `$plan-feature` so `explorer` surfaces the current repo patterns before `planner` writes the artifacts."
        : "Route non-trivial planning through `$plan-feature` so the current session performs exploration before writing the artifacts.",
      implementationRoutingRule: isMultiAgent
        ? "Route non-trivial implementation or refactor work through `$build-feature` so `executor`, `tester`, `verifier`, `reviewer`, and the repo-local quality skills are all used."
        : "Route non-trivial implementation or refactor work through `$build-feature` so the current session still follows the full plan, testing, verification, review, and quality-skill workflow."
    })
  };
}
