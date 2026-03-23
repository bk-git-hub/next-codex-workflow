import type { PackageJson } from "../utils/package-json.js";
import { getDependencyVersion } from "../utils/package-json.js";
import { pathExists, resolveFrom } from "../utils/fs.js";

export interface TypeScriptDetection {
  enabled: boolean;
  hasTsconfig: boolean;
  dependencyVersion: string | null;
}

export async function detectTypescript(rootDir: string, packageJson: PackageJson): Promise<TypeScriptDetection> {
  const hasTsconfig = await pathExists(resolveFrom(rootDir, "tsconfig.json"));
  const dependencyVersion = getDependencyVersion(packageJson, "typescript");

  return {
    enabled: hasTsconfig || dependencyVersion !== null,
    hasTsconfig,
    dependencyVersion
  };
}
