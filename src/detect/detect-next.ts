import { getDependencyVersion, type PackageJson } from "../utils/package-json.js";
import type { RouterDetection } from "./detect-router.js";

export interface NextDetection {
  isNextRepository: boolean;
  nextVersion: string | null;
  nextMajor: number | null;
  error: string | null;
}

export function detectNextRepository(packageJson: PackageJson, router: RouterDetection): NextDetection {
  const nextVersion = getDependencyVersion(packageJson, "next");

  if (!nextVersion) {
    return {
      isNextRepository: false,
      nextVersion: null,
      nextMajor: null,
      error: "package.json does not declare next in dependencies or devDependencies."
    };
  }

  if (!router.appRouter && !router.pagesRouter) {
    return {
      isNextRepository: false,
      nextVersion,
      nextMajor: parseNextMajor(nextVersion),
      error: "No Next.js app/ or pages/ directory was found."
    };
  }

  return {
    isNextRepository: true,
    nextVersion,
    nextMajor: parseNextMajor(nextVersion),
    error: null
  };
}

function parseNextMajor(version: string): number | null {
  const match = version.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}
