import { readFile } from "node:fs/promises";

import { pathExists, resolveFrom } from "../utils/fs.js";
import { MANAGED_FILE_MARKER } from "./types.js";

export const MANAGED_REGISTRY_PATH = "agent-workflow/manifest/managed-files.json";

interface ManagedRegistry {
  _generatedBy: string;
  version: number;
  paths: string[];
}

export async function loadManagedRegistry(rootDir: string): Promise<Set<string>> {
  const registryPath = resolveFrom(rootDir, MANAGED_REGISTRY_PATH);

  if (!(await pathExists(registryPath))) {
    return new Set<string>();
  }

  try {
    const raw = await readFile(registryPath, "utf8");
    const parsed = JSON.parse(raw) as ManagedRegistry;

    if (parsed._generatedBy !== MANAGED_FILE_MARKER || !Array.isArray(parsed.paths)) {
      return new Set<string>();
    }

    return new Set(parsed.paths);
  } catch {
    return new Set<string>();
  }
}

export function serializeManagedRegistry(paths: string[]): string {
  return JSON.stringify(
    {
      _generatedBy: MANAGED_FILE_MARKER,
      version: 1,
      paths
    },
    null,
    2
  );
}
