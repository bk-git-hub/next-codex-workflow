import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { formatInitSummary, parseInitArgs, runInitCommand } from "../src/cli/commands/init.js";

const createdDirectories: string[] = [];

async function createTempRepository(): Promise<string> {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "next-codex-workflow-init-"));
  createdDirectories.push(tempRoot);
  return tempRoot;
}

afterEach(async () => {
  await Promise.all(createdDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("parseInitArgs", () => {
  it("parses the supported init flags", () => {
    const result = parseInitArgs([
      "--yes",
      "--performance",
      "--routes",
      "/,/dashboard",
      "--external-skill-set",
      "full",
      "--overwrite-managed",
      "--dry-run"
    ]);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.options).toEqual({
      yes: true,
      performance: true,
      routes: ["/", "/dashboard"],
      externalSkillSet: "full",
      overwriteManaged: true,
      dryRun: true,
      help: false
    });
  });

  it("rejects an invalid external skill set", () => {
    const result = parseInitArgs(["--external-skill-set", "custom"]);

    expect(result).toEqual({
      ok: false,
      error: "Invalid value for --external-skill-set: custom. Expected minimal, recommended, or full."
    });
  });

  it("rejects missing values for flags that require them", () => {
    const result = parseInitArgs(["--routes"]);

    expect(result).toEqual({
      ok: false,
      error: "Missing value for --routes."
    });
  });
});

describe("runInitCommand", () => {
  it("returns a dry-run summary for a supported repository", async () => {
    const rootDir = await createTempRepository();

    await writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          dependencies: {
            next: "^16.0.0"
          },
          scripts: {
            dev: "next dev",
            build: "next build",
            lint: "eslint ."
          }
        },
        null,
        2
      )
    );
    await writeFile(path.join(rootDir, "package-lock.json"), "");
    await mkdir(path.join(rootDir, "app"), { recursive: true });
    await writeFile(path.join(rootDir, "app", "page.tsx"), "export default function Page() { return null; }");

    const result = await runInitCommand({
      yes: false,
      performance: true,
      routes: ["/"],
      externalSkillSet: "recommended",
      overwriteManaged: false,
      dryRun: true,
      help: false
    }, { cwd: rootDir });

    expect(result.exitCode).toBe(0);
    expect(result.mode).toBe("dry-run");
    expect(formatInitSummary(result)).toContain("Dry run requested. No files were written.");
    expect(formatInitSummary(result)).toContain("Detected package manager: npm.");
  });

  it("returns an unsupported repository error with exit code 2", async () => {
    const rootDir = await createTempRepository();

    await writeFile(path.join(rootDir, "package.json"), JSON.stringify({ name: "empty" }, null, 2));

    const result = await runInitCommand(
      {
        yes: false,
        performance: false,
        routes: [],
        externalSkillSet: "recommended",
        overwriteManaged: false,
        dryRun: false,
        help: false
      },
      { cwd: rootDir }
    );

    expect(result.exitCode).toBe(2);
    expect(formatInitSummary(result)).toContain("Unsupported repository");
  });
});
