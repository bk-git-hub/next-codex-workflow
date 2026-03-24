import process from "node:process";

import { detectCodexMultiAgent } from "../../detect/detect-codex-multi-agent.js";
import { inspectRepository, type RepositoryInspection } from "../../detect/inspect-repository.js";
import { writeTargetTree } from "../../generate/write-target-tree.js";
import type { InitPrompter } from "./prompt-init-options.js";
import { promptInitOptions } from "./prompt-init-options.js";

export type ExternalSkillSet = "minimal" | "recommended" | "full";
export type WorkflowMode = "single-agent" | "multi-agent";

export interface InitOptions {
  yes: boolean;
  performance: boolean;
  routes: string[];
  externalSkillSet: ExternalSkillSet;
  workflowMode: WorkflowMode;
  overwriteManaged: boolean;
  dryRun: boolean;
  help: boolean;
}

export interface InitResult {
  exitCode: number;
  mode: "dry-run" | "apply";
  options: InitOptions;
  targetDirectory: string;
  notes: string[];
  warnings: string[];
  error: string | null;
  inspection: RepositoryInspection | null;
  actions: string[];
}

type ParseResult =
  | { ok: true; options: InitOptions }
  | { ok: false; error: string };

const validSkillSets = new Set<ExternalSkillSet>(["minimal", "recommended", "full"]);
const validWorkflowModes = new Set<WorkflowMode>(["single-agent", "multi-agent"]);

const defaultInitOptions: InitOptions = {
  yes: false,
  performance: false,
  routes: [],
  externalSkillSet: "recommended",
  workflowMode: "multi-agent",
  overwriteManaged: false,
  dryRun: false,
  help: false
};

function nextValue(args: string[], index: number, flag: string): string {
  const value = args[index + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}.`);
  }

  return value;
}

export function parseInitArgs(args: string[]): ParseResult {
  const options: InitOptions = { ...defaultInitOptions };

  try {
    for (let index = 0; index < args.length; index += 1) {
      const arg = args[index];

      switch (arg) {
        case "--yes":
          options.yes = true;
          break;
        case "--performance":
          options.performance = true;
          break;
        case "--overwrite-managed":
          options.overwriteManaged = true;
          break;
        case "--dry-run":
          options.dryRun = true;
          break;
        case "--help":
          options.help = true;
          break;
        case "--routes": {
          const rawValue = nextValue(args, index, arg);
          options.routes = rawValue
            .split(",")
            .map((route) => route.trim())
            .filter(Boolean);
          index += 1;
          break;
        }
        case "--external-skill-set": {
          const rawValue = nextValue(args, index, arg);

          if (!validSkillSets.has(rawValue as ExternalSkillSet)) {
            return {
              ok: false,
              error: `Invalid value for --external-skill-set: ${rawValue}. Expected minimal, recommended, or full.`
            };
          }

          options.externalSkillSet = rawValue as ExternalSkillSet;
          index += 1;
          break;
        }
        case "--workflow-mode": {
          const rawValue = nextValue(args, index, arg);

          if (!validWorkflowModes.has(rawValue as WorkflowMode)) {
            return {
              ok: false,
              error: `Invalid value for --workflow-mode: ${rawValue}. Expected single-agent or multi-agent.`
            };
          }

          options.workflowMode = rawValue as WorkflowMode;
          index += 1;
          break;
        }
        default:
          return {
            ok: false,
            error: `Unknown init option: ${arg}`
          };
      }
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to parse init arguments."
    };
  }

  return {
    ok: true,
    options
  };
}

function formatRouterStyle(inspection: RepositoryInspection): string {
  if (inspection.router.appRouter && inspection.router.pagesRouter) {
    return "App Router + Pages Router";
  }

  if (inspection.router.appRouter) {
    return "App Router";
  }

  if (inspection.router.pagesRouter) {
    return "Pages Router";
  }

  return "Unknown";
}

function formatDetectedScripts(inspection: RepositoryInspection): string {
  const supportedScripts = [
    inspection.scripts.dev ? "dev" : null,
    inspection.scripts.build ? "build" : null,
    inspection.scripts.lint ? "lint" : null,
    inspection.scripts.test ? "test" : null,
    inspection.scripts.typecheck ? "typecheck" : null
  ].filter((value): value is string => value !== null);

  return supportedScripts.length > 0 ? supportedScripts.join(", ") : "(none)";
}

export async function runInitCommand(
  options: InitOptions,
  context: { cwd?: string; homeDir?: string; prompter?: InitPrompter; interactive?: boolean } = {}
): Promise<InitResult> {
  const targetDirectory = context.cwd ?? process.cwd();
  let resolvedOptions = options;
  const allowPrompt = context.interactive ?? true;

  if (allowPrompt && !options.yes && (context.prompter || (process.stdin.isTTY && process.stdout.isTTY))) {
    const promptResult = await (context.prompter ?? promptInitOptions)(options);
    resolvedOptions = {
      ...options,
      ...promptResult
    };
  }

  const inspectionResult = await inspectRepository(targetDirectory, { yes: resolvedOptions.yes });

  if (!inspectionResult.ok) {
    return {
      exitCode: inspectionResult.exitCode,
      mode: resolvedOptions.dryRun ? "dry-run" : "apply",
      options: resolvedOptions,
      targetDirectory,
      notes: [],
      warnings: inspectionResult.warnings,
      error: inspectionResult.error,
      inspection: null,
      actions: []
    };
  }

  const writeResult = await writeTargetTree(
    targetDirectory,
    {
      inspection: inspectionResult.inspection,
      options: resolvedOptions
    },
    {
      dryRun: resolvedOptions.dryRun,
      overwriteManaged: resolvedOptions.overwriteManaged
    }
  );

  if (!writeResult.ok) {
    return {
      exitCode: 3,
      mode: resolvedOptions.dryRun ? "dry-run" : "apply",
      options: resolvedOptions,
      targetDirectory,
      notes: [],
      warnings: inspectionResult.warnings,
      error: `Conflicting unmanaged files detected: ${writeResult.conflictPaths.join(", ")}`,
      inspection: inspectionResult.inspection,
      actions: []
    };
  }

  const codexMultiAgentStatus = await detectCodexMultiAgent(context.homeDir);
  const notes = [
    `Workflow mode: ${resolvedOptions.workflowMode}.`,
    `Detected package manager: ${inspectionResult.inspection.packageManager.packageManager ?? "unknown"}.`,
    `Detected router style: ${formatRouterStyle(inspectionResult.inspection)}.`,
    `Detected scripts: ${formatDetectedScripts(inspectionResult.inspection)}.`,
    `TypeScript enabled: ${inspectionResult.inspection.typescript.enabled ? "yes" : "no"}.`,
    `Performance mode is ${inspectionResult.inspection.performance.eligible ? "eligible" : "incomplete"} for this repository.`
  ];

  if (inspectionResult.inspection.performance.discoveredRoutes.length > 0) {
    notes.push(
      `Discovered routes: ${inspectionResult.inspection.performance.discoveredRoutes.join(", ")}.`
    );
  }

  if (resolvedOptions.performance && !inspectionResult.inspection.performance.eligible) {
    notes.push(
      `Performance generation will need follow-up: ${inspectionResult.inspection.performance.reasons.join(" ")}`
    );
  }

  if (resolvedOptions.workflowMode === "multi-agent" && codexMultiAgentStatus.enabled) {
    notes.push(`Detected Codex multi-agent: enabled in ${codexMultiAgentStatus.configPath}.`);
  }

  notes.push("Open a new Codex session in this repository after init so the generated repo-local skills are loaded.");

  const warnings = [...inspectionResult.warnings];

  if (resolvedOptions.workflowMode === "multi-agent" && !codexMultiAgentStatus.enabled) {
    warnings.push(
      `Codex multi-agent is not enabled in ${codexMultiAgentStatus.configPath}. Run /multi-agent in Codex CLI and start a new session before relying on the generated workflow shortcuts.`
    );
  }

  if (resolvedOptions.dryRun) {
    notes.unshift("Dry run requested. No files were written.");
  } else {
    notes.push(`Generated ${writeResult.actions.length} managed files.`);
  }

  if (resolvedOptions.dryRun) {
    notes.push(`Planned ${writeResult.actions.length} managed files.`);
  }

  const actions = writeResult.actions.map((action) => `${action.kind}: ${action.relativePath}`);

  return {
    exitCode: 0,
    mode: resolvedOptions.dryRun ? "dry-run" : "apply",
    options: resolvedOptions,
    targetDirectory,
    notes,
    warnings,
    error: null,
    inspection: inspectionResult.inspection,
    actions
  };
}

export function formatInitSummary(result: InitResult): string {
  const lines = [
    `Mode: ${result.mode}`,
    `Target directory: ${result.targetDirectory}`,
    `External skill set: ${result.options.externalSkillSet}`,
    `Performance enabled: ${result.options.performance ? "yes" : "no"}`,
    `Routes: ${result.options.routes.length > 0 ? result.options.routes.join(", ") : "(none)"}`,
    `Workflow mode: ${result.options.workflowMode}`,
    `Overwrite managed: ${result.options.overwriteManaged ? "yes" : "no"}`,
    `Auto-confirm: ${result.options.yes ? "yes" : "no"}`
  ];

  if (result.error) {
    lines.push(`Error: ${result.error}`);
  }

  if (result.warnings.length > 0) {
    lines.push("");
    lines.push("Warnings:");

    for (const warning of result.warnings) {
      lines.push(`- ${warning}`);
    }
  }

  lines.push("");

  for (const note of result.notes) {
    lines.push(`- ${note}`);
  }

  if (result.actions.length > 0) {
    lines.push("");
    lines.push("Planned changes:");

    for (const action of result.actions) {
      lines.push(`- ${action}`);
    }
  }

  return lines.join("\n");
}
