import { pathExists, resolveFrom } from "../utils/fs.js";

export type PackageManager = "pnpm" | "yarn" | "bun" | "npm";

export interface PackageManagerDetection {
  packageManager: PackageManager | null;
  detectedLockfiles: string[];
  warning: string | null;
  error: string | null;
}

const lockfilePriority: Array<{ file: string; packageManager: PackageManager }> = [
  { file: "pnpm-lock.yaml", packageManager: "pnpm" },
  { file: "yarn.lock", packageManager: "yarn" },
  { file: "bun.lockb", packageManager: "bun" },
  { file: "bun.lock", packageManager: "bun" },
  { file: "package-lock.json", packageManager: "npm" }
];

export async function detectPackageManager(
  rootDir: string,
  options: { yes: boolean }
): Promise<PackageManagerDetection> {
  const detectedEntries = await Promise.all(
    lockfilePriority.map(async (entry) => ((await pathExists(resolveFrom(rootDir, entry.file))) ? entry : null))
  );

  const matches = detectedEntries.filter((entry): entry is (typeof lockfilePriority)[number] => entry !== null);
  const uniqueLockfiles = matches.map((entry) => entry.file);

  if (matches.length === 0) {
    return {
      packageManager: null,
      detectedLockfiles: [],
      warning: "No known package manager lockfile was found. Defaulting to npm-compatible guidance for now.",
      error: null
    };
  }

  const selected = matches[0];

  if (matches.length > 1 && !options.yes) {
    return {
      packageManager: null,
      detectedLockfiles: uniqueLockfiles,
      warning: null,
      error: `Multiple lockfiles detected: ${uniqueLockfiles.join(", ")}. Re-run with --yes to accept the priority order, or remove the ambiguity first.`
    };
  }

  if (matches.length > 1) {
    return {
      packageManager: selected.packageManager,
      detectedLockfiles: uniqueLockfiles,
      warning: `Multiple lockfiles detected: ${uniqueLockfiles.join(", ")}. Using ${selected.packageManager} because --yes was supplied.`,
      error: null
    };
  }

  return {
    packageManager: selected.packageManager,
    detectedLockfiles: uniqueLockfiles,
    warning: null,
    error: null
  };
}
