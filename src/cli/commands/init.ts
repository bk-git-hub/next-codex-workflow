import process from "node:process";

import { inspectRepository, type RepositoryInspection } from "../../detect/inspect-repository.js";

export type ExternalSkillSet = "minimal" | "recommended" | "full";

export interface InitOptions {
  yes: boolean;
  performance: boolean;
  routes: string[];
  externalSkillSet: ExternalSkillSet;
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
}

type ParseResult =
  | { ok: true; options: InitOptions }
  | { ok: false; error: string };

const validSkillSets = new Set<ExternalSkillSet>(["minimal", "recommended", "full"]);

const defaultInitOptions: InitOptions = {
  yes: false,
  performance: false,
  routes: [],
  externalSkillSet: "recommended",
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
  context: { cwd?: string } = {}
): Promise<InitResult> {
  const targetDirectory = context.cwd ?? process.cwd();
  const inspectionResult = await inspectRepository(targetDirectory, { yes: options.yes });

  if (!inspectionResult.ok) {
    return {
      exitCode: inspectionResult.exitCode,
      mode: options.dryRun ? "dry-run" : "apply",
      options,
      targetDirectory,
      notes: [],
      warnings: inspectionResult.warnings,
      error: inspectionResult.error,
      inspection: null
    };
  }

  const notes = [
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

  if (options.performance && !inspectionResult.inspection.performance.eligible) {
    notes.push(
      `Performance generation will need follow-up: ${inspectionResult.inspection.performance.reasons.join(" ")}`
    );
  }

  if (options.dryRun) {
    notes.unshift("Dry run requested. No files were written.");
  } else {
    notes.push("Repository validation passed. File generation will be added in the next implementation step.");
  }

  return {
    exitCode: 0,
    mode: options.dryRun ? "dry-run" : "apply",
    options,
    targetDirectory,
    notes,
    warnings: inspectionResult.warnings,
    error: null,
    inspection: inspectionResult.inspection
  };
}

export function formatInitSummary(result: InitResult): string {
  const lines = [
    `Mode: ${result.mode}`,
    `Target directory: ${result.targetDirectory}`,
    `External skill set: ${result.options.externalSkillSet}`,
    `Performance enabled: ${result.options.performance ? "yes" : "no"}`,
    `Routes: ${result.options.routes.length > 0 ? result.options.routes.join(", ") : "(none)"}`,
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

  return lines.join("\n");
}
