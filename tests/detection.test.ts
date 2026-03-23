import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { inspectRepository } from "../src/detect/inspect-repository.js";

const createdDirectories: string[] = [];

async function createTempRepository(): Promise<string> {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "next-codex-workflow-"));
  createdDirectories.push(tempRoot);
  return tempRoot;
}

async function writePackageJson(rootDir: string, packageJson: Record<string, unknown>): Promise<void> {
  await writeFile(path.join(rootDir, "package.json"), JSON.stringify(packageJson, null, 2));
}

afterEach(async () => {
  await Promise.all(createdDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("inspectRepository", () => {
  it("detects a supported App Router repository", async () => {
    const rootDir = await createTempRepository();

    await writePackageJson(rootDir, {
      name: "fixture-app-router",
      dependencies: {
        next: "^16.0.0",
        react: "^19.0.0"
      },
      devDependencies: {
        typescript: "^5.9.0"
      },
      scripts: {
        dev: "next dev",
        build: "next build",
        lint: "eslint .",
        test: "vitest run"
      }
    });

    await writeFile(path.join(rootDir, "package-lock.json"), "");
    await writeFile(path.join(rootDir, "tsconfig.json"), "{}");
    await mkdir(path.join(rootDir, "app"), { recursive: true });
    await writeFile(path.join(rootDir, "app", "page.tsx"), "export default function Page() { return null; }");
    await mkdir(path.join(rootDir, "app", "dashboard"), { recursive: true });
    await writeFile(
      path.join(rootDir, "app", "dashboard", "page.tsx"),
      "export default function Dashboard() { return null; }"
    );

    const result = await inspectRepository(rootDir, { yes: false });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.inspection.next.nextMajor).toBe(16);
    expect(result.inspection.packageManager.packageManager).toBe("npm");
    expect(result.inspection.router.appRouter).toBe(true);
    expect(result.inspection.router.pagesRouter).toBe(false);
    expect(result.inspection.typescript.enabled).toBe(true);
    expect(result.inspection.performance.eligible).toBe(true);
    expect(result.inspection.performance.discoveredRoutes).toEqual(["/", "/dashboard"]);
  });

  it("fails clearly when package.json is missing", async () => {
    const rootDir = await createTempRepository();

    const result = await inspectRepository(rootDir, { yes: false });

    expect(result).toEqual({
      ok: false,
      exitCode: 2,
      error: "Unsupported repository: package.json was not found.",
      warnings: []
    });
  });

  it("fails clearly when next is not declared", async () => {
    const rootDir = await createTempRepository();

    await writePackageJson(rootDir, {
      name: "not-next",
      scripts: {
        dev: "vite"
      }
    });
    await mkdir(path.join(rootDir, "app"), { recursive: true });

    const result = await inspectRepository(rootDir, { yes: false });

    expect(result).toEqual({
      ok: false,
      exitCode: 2,
      error: "Unsupported repository: package.json does not declare next in dependencies or devDependencies.",
      warnings: []
    });
  });

  it("requires disambiguation for multiple lockfiles unless --yes is supplied", async () => {
    const rootDir = await createTempRepository();

    await writePackageJson(rootDir, {
      name: "multi-lockfile",
      dependencies: {
        next: "^15.0.0"
      },
      scripts: {
        dev: "next dev",
        build: "next build"
      }
    });
    await mkdir(path.join(rootDir, "pages"), { recursive: true });
    await writeFile(path.join(rootDir, "pages", "index.tsx"), "export default function Home() { return null; }");
    await writeFile(path.join(rootDir, "package-lock.json"), "");
    await writeFile(path.join(rootDir, "pnpm-lock.yaml"), "");

    const strictResult = await inspectRepository(rootDir, { yes: false });

    expect(strictResult).toEqual({
      ok: false,
      exitCode: 1,
      error:
        "Multiple lockfiles detected: pnpm-lock.yaml, package-lock.json. Re-run with --yes to accept the priority order, or remove the ambiguity first.",
      warnings: []
    });

    const permissiveResult = await inspectRepository(rootDir, { yes: true });

    expect(permissiveResult.ok).toBe(true);

    if (!permissiveResult.ok) {
      return;
    }

    expect(permissiveResult.inspection.packageManager.packageManager).toBe("pnpm");
    expect(permissiveResult.warnings).toEqual([
      "Multiple lockfiles detected: pnpm-lock.yaml, package-lock.json. Using pnpm because --yes was supplied."
    ]);
  });
});
