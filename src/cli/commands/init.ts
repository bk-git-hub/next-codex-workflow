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
  notes: string[];
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

  return {
    ok: true,
    options
  };
}

export async function runInitCommand(options: InitOptions): Promise<InitResult> {
  const notes = [
    "Scaffolded CLI is in place.",
    "Repository detection and file generation will land in the next implementation step."
  ];

  if (options.dryRun) {
    notes.unshift("Dry run requested. No files were written.");
  }

  return {
    exitCode: 0,
    mode: options.dryRun ? "dry-run" : "apply",
    options,
    notes
  };
}

export function formatInitSummary(result: InitResult): string {
  const lines = [
    `Mode: ${result.mode}`,
    `External skill set: ${result.options.externalSkillSet}`,
    `Performance enabled: ${result.options.performance ? "yes" : "no"}`,
    `Routes: ${result.options.routes.length > 0 ? result.options.routes.join(", ") : "(none)"}`,
    `Overwrite managed: ${result.options.overwriteManaged ? "yes" : "no"}`,
    `Auto-confirm: ${result.options.yes ? "yes" : "no"}`,
    ""
  ];

  for (const note of result.notes) {
    lines.push(`- ${note}`);
  }

  return lines.join("\n");
}
