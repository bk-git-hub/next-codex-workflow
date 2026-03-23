import { loadPackageJson } from "../utils/package-json.js";
import { detectNextRepository, type NextDetection } from "./detect-next.js";
import { detectPackageManager, type PackageManagerDetection } from "./detect-package-manager.js";
import { detectPerformanceEligibility, type PerformanceEligibility } from "./detect-performance-eligibility.js";
import { detectRouter, type RouterDetection } from "./detect-router.js";
import { detectScripts, type ScriptDetection } from "./detect-scripts.js";
import { detectTypescript, type TypeScriptDetection } from "./detect-typescript.js";

export interface RepositoryInspection {
  rootDir: string;
  packageManager: PackageManagerDetection;
  router: RouterDetection;
  scripts: ScriptDetection;
  typescript: TypeScriptDetection;
  next: NextDetection;
  performance: PerformanceEligibility;
}

type InspectionResult =
  | { ok: true; inspection: RepositoryInspection; warnings: string[] }
  | { ok: false; exitCode: number; error: string; warnings: string[] };

export async function inspectRepository(
  rootDir: string,
  options: { yes: boolean }
): Promise<InspectionResult> {
  const loadedPackageJson = await loadPackageJson(rootDir);

  if (!loadedPackageJson) {
    return {
      ok: false,
      exitCode: 2,
      error: "Unsupported repository: package.json was not found.",
      warnings: []
    };
  }

  const warnings: string[] = [];
  const router = await detectRouter(rootDir);
  const next = detectNextRepository(loadedPackageJson.packageJson, router);

  if (!next.isNextRepository) {
    return {
      ok: false,
      exitCode: 2,
      error: `Unsupported repository: ${next.error}`,
      warnings
    };
  }

  const packageManager = await detectPackageManager(rootDir, options);

  if (packageManager.error) {
    return {
      ok: false,
      exitCode: 1,
      error: packageManager.error,
      warnings
    };
  }

  if (packageManager.warning) {
    warnings.push(packageManager.warning);
  }

  const scripts = detectScripts(loadedPackageJson.packageJson);
  const typescript = await detectTypescript(rootDir, loadedPackageJson.packageJson);
  const performance = await detectPerformanceEligibility(rootDir, router, scripts);

  return {
    ok: true,
    inspection: {
      rootDir,
      packageManager,
      router,
      scripts,
      typescript,
      next,
      performance
    },
    warnings
  };
}
