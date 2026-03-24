import process from "node:process";

import type { InitResult } from "./init.js";
import { formatInitSummary, runInitCommand, type InitOptions } from "./init.js";
import { resolveInstallState } from "../../generate/install-state.js";

export interface UpdateOptions {
  yes: boolean;
  dryRun: boolean;
  help: boolean;
}

type ParseResult =
  | { ok: true; options: UpdateOptions }
  | { ok: false; error: string };

const defaultUpdateOptions: UpdateOptions = {
  yes: false,
  dryRun: false,
  help: false
};

export function parseUpdateArgs(args: string[]): ParseResult {
  const options: UpdateOptions = { ...defaultUpdateOptions };

  for (const arg of args) {
    switch (arg) {
      case "--yes":
        options.yes = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--help":
        options.help = true;
        break;
      default:
        return {
          ok: false,
          error: `Unknown update option: ${arg}`
        };
    }
  }

  return {
    ok: true,
    options
  };
}

export async function runUpdateCommand(
  options: UpdateOptions,
  context: { cwd?: string; homeDir?: string } = {}
): Promise<InitResult> {
  const targetDirectory = context.cwd ?? process.cwd();
  const installState = await resolveInstallState(targetDirectory);

  if (!installState) {
    return {
      exitCode: 4,
      mode: options.dryRun ? "dry-run" : "apply",
      options: {
        yes: options.yes,
        performance: false,
        routes: [],
        externalSkillSet: "recommended",
        overwriteManaged: true,
        dryRun: options.dryRun,
        help: false
      },
      targetDirectory,
      notes: [],
      warnings: [],
      error:
        "No existing next-codex-workflow installation was detected. Run `next-codex-workflow init` first.",
      inspection: null,
      actions: []
    };
  }

  const initOptions: InitOptions = {
    yes: options.yes,
    performance: installState.options.performance,
    routes: installState.options.routes,
    externalSkillSet: installState.options.externalSkillSet,
    overwriteManaged: true,
    dryRun: options.dryRun,
    help: false
  };

  const result = await runInitCommand(initOptions, context);
  const sourceNote =
    installState.source === "manifest"
      ? "Loaded saved workflow options from agent-workflow/manifest/install-state.json."
      : "Loaded workflow options by inferring them from the existing generated files in this repository.";

  return {
    ...result,
    notes: [
      sourceNote,
      "Update refreshes files previously managed by this tool and still protects user-owned files.",
      ...result.notes
    ],
    warnings: [...installState.warnings, ...result.warnings]
  };
}

export function formatUpdateSummary(result: InitResult): string {
  return ["Command: update", formatInitSummary(result)].join("\n");
}
