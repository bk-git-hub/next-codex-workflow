import { pathExists, resolveFrom } from "../utils/fs.js";

export type PreferredRouter = "app" | "pages" | "unknown";

export interface RouterDetection {
  appRouter: boolean;
  pagesRouter: boolean;
  appPaths: string[];
  pagesPaths: string[];
  preferredRouter: PreferredRouter;
}

export async function detectRouter(rootDir: string): Promise<RouterDetection> {
  const appCandidates = ["app", "src/app"];
  const pagesCandidates = ["pages", "src/pages"];

  const appPaths = await filterExistingPaths(rootDir, appCandidates);
  const pagesPaths = await filterExistingPaths(rootDir, pagesCandidates);

  return {
    appRouter: appPaths.length > 0,
    pagesRouter: pagesPaths.length > 0,
    appPaths,
    pagesPaths,
    preferredRouter: appPaths.length > 0 ? "app" : pagesPaths.length > 0 ? "pages" : "unknown"
  };
}

async function filterExistingPaths(rootDir: string, candidates: string[]): Promise<string[]> {
  const results = await Promise.all(
    candidates.map(async (candidate) => {
      const targetPath = resolveFrom(rootDir, candidate);
      return (await pathExists(targetPath)) ? candidate : null;
    })
  );

  return results.filter((value): value is string => value !== null);
}
