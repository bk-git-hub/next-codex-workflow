import type { PackageJson } from "../utils/package-json.js";

export interface ScriptDetection {
  dev: boolean;
  build: boolean;
  lint: boolean;
  test: boolean;
  typecheck: boolean;
  start: boolean;
  availableScripts: string[];
}

export function detectScripts(packageJson: PackageJson): ScriptDetection {
  const scripts = packageJson.scripts ?? {};

  return {
    dev: Boolean(scripts.dev),
    build: Boolean(scripts.build),
    lint: Boolean(scripts.lint),
    test: Boolean(scripts.test),
    typecheck: Boolean(scripts.typecheck),
    start: Boolean(scripts.start),
    availableScripts: Object.keys(scripts).sort()
  };
}
