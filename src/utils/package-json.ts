import { readFile } from "node:fs/promises";

import { pathExists, resolveFrom } from "./fs.js";

export interface PackageJson {
  name?: string;
  version?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface LoadedPackageJson {
  path: string;
  packageJson: PackageJson;
}

export async function loadPackageJson(rootDir: string): Promise<LoadedPackageJson | null> {
  const packageJsonPath = resolveFrom(rootDir, "package.json");

  if (!(await pathExists(packageJsonPath))) {
    return null;
  }

  const raw = await readFile(packageJsonPath, "utf8");

  return {
    path: packageJsonPath,
    packageJson: JSON.parse(raw) as PackageJson
  };
}

export function getDependencyVersion(packageJson: PackageJson, packageName: string): string | null {
  return packageJson.dependencies?.[packageName] ?? packageJson.devDependencies?.[packageName] ?? null;
}
