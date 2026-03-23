import { pathExists, resolveFrom } from "../utils/fs.js";
import type { RouterDetection } from "./detect-router.js";
import type { ScriptDetection } from "./detect-scripts.js";

export interface PerformanceEligibility {
  eligible: boolean;
  discoveredRoutes: string[];
  reasons: string[];
}

export async function detectPerformanceEligibility(
  rootDir: string,
  router: RouterDetection,
  scripts: ScriptDetection
): Promise<PerformanceEligibility> {
  const discoveredRoutes = await discoverRoutes(rootDir, router);
  const reasons: string[] = [];

  if (!scripts.build) {
    reasons.push("Missing build script.");
  }

  if (!scripts.dev && !scripts.start) {
    reasons.push("Missing dev or start script.");
  }

  if (discoveredRoutes.length === 0) {
    reasons.push("No user-facing routes were discovered.");
  }

  return {
    eligible: reasons.length === 0,
    discoveredRoutes,
    reasons
  };
}

async function discoverRoutes(rootDir: string, router: RouterDetection): Promise<string[]> {
  const routeChecks: Array<[string, string[]]> = [
    [
      "/",
      router.appRouter
        ? ["app/page.tsx", "app/page.ts", "src/app/page.tsx", "src/app/page.ts"]
        : ["pages/index.tsx", "pages/index.ts", "src/pages/index.tsx", "src/pages/index.ts"]
    ],
    [
      "/dashboard",
      router.appRouter
        ? [
            "app/dashboard/page.tsx",
            "app/dashboard/page.ts",
            "src/app/dashboard/page.tsx",
            "src/app/dashboard/page.ts"
          ]
        : [
            "pages/dashboard.tsx",
            "pages/dashboard.ts",
            "pages/dashboard/index.tsx",
            "pages/dashboard/index.ts",
            "src/pages/dashboard.tsx",
            "src/pages/dashboard.ts",
            "src/pages/dashboard/index.tsx",
            "src/pages/dashboard/index.ts"
          ]
    ]
  ];

  const discovered: string[] = [];

  for (const [route, candidates] of routeChecks) {
    const matches = await Promise.all(candidates.map((candidate) => pathExists(resolveFrom(rootDir, candidate))));

    if (matches.some(Boolean)) {
      discovered.push(route);
    }
  }

  return discovered;
}
