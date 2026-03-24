import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { formatInitSummary, parseInitArgs, runInitCommand } from "../src/cli/commands/init.js";

const createdDirectories: string[] = [];

async function createTempRepository(): Promise<string> {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "next-codex-workflow-init-"));
  createdDirectories.push(tempRoot);
  return tempRoot;
}

async function createTempHomeDirectory(): Promise<string> {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "next-codex-workflow-home-"));
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
      "--workflow-mode",
      "single-agent",
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
      workflowMode: "single-agent",
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

  it("rejects an invalid workflow mode", () => {
    const result = parseInitArgs(["--workflow-mode", "parallel"]);

    expect(result).toEqual({
      ok: false,
      error: "Invalid value for --workflow-mode: parallel. Expected single-agent or multi-agent."
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
    const homeDir = await createTempHomeDirectory();

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
      workflowMode: "multi-agent",
      overwriteManaged: false,
      dryRun: true,
      help: false
    }, { cwd: rootDir, homeDir });

    expect(result.exitCode).toBe(0);
    expect(result.mode).toBe("dry-run");
    expect(formatInitSummary(result)).toContain("Dry run requested. No files were written.");
    expect(formatInitSummary(result)).toContain("Detected package manager: npm.");
    expect(result.warnings).toContain(
      `Codex multi-agent is not enabled in ${path.join(homeDir, ".codex", "config.toml")}. Run /multi-agent in Codex CLI and start a new session before relying on the generated workflow shortcuts.`
    );
    expect(result.actions.some((action) => action.endsWith("AGENTS.md"))).toBe(true);
  });

  it("notes when Codex multi-agent is already enabled", async () => {
    const rootDir = await createTempRepository();
    const homeDir = await createTempHomeDirectory();

    await mkdir(path.join(homeDir, ".codex"), { recursive: true });
    await writeFile(
      path.join(homeDir, ".codex", "config.toml"),
      ['model = "gpt-5.4"', "[features]", "multi_agent = true", ""].join("\n")
    );

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

    const result = await runInitCommand(
      {
        yes: false,
        performance: false,
        routes: [],
        externalSkillSet: "recommended",
        workflowMode: "multi-agent",
        overwriteManaged: false,
        dryRun: true,
        help: false
      },
      { cwd: rootDir, homeDir }
    );

    expect(result.exitCode).toBe(0);
    expect(result.notes).toContain(`Detected Codex multi-agent: enabled in ${path.join(homeDir, ".codex", "config.toml")}.`);
    expect(result.warnings).not.toContain(
      `Codex multi-agent is not enabled in ${path.join(homeDir, ".codex", "config.toml")}. Run /multi-agent in Codex CLI and start a new session before relying on the generated workflow shortcuts.`
    );
  });

  it("does not require Codex multi-agent when the workflow mode is single-agent", async () => {
    const rootDir = await createTempRepository();
    const homeDir = await createTempHomeDirectory();

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

    const result = await runInitCommand(
      {
        yes: false,
        performance: false,
        routes: [],
        externalSkillSet: "recommended",
        workflowMode: "single-agent",
        overwriteManaged: false,
        dryRun: true,
        help: false
      },
      { cwd: rootDir, homeDir }
    );

    expect(result.exitCode).toBe(0);
    expect(result.notes).toContain("Workflow mode: single-agent.");
    expect(result.warnings).not.toContain(
      `Codex multi-agent is not enabled in ${path.join(homeDir, ".codex", "config.toml")}. Run /multi-agent in Codex CLI and start a new session before relying on the generated workflow shortcuts.`
    );
  });

  it("uses the interactive installer selections when a prompter is provided", async () => {
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

    const prompter = vi.fn(async () => ({
      workflowMode: "single-agent" as const,
      externalSkillSet: "full" as const,
      performance: true,
      routes: ["/", "/dashboard"]
    }));

    const result = await runInitCommand(
      {
        yes: false,
        performance: false,
        routes: [],
        externalSkillSet: "recommended",
        workflowMode: "multi-agent",
        overwriteManaged: false,
        dryRun: true,
        help: false
      },
      { cwd: rootDir, prompter }
    );

    expect(result.exitCode).toBe(0);
    expect(prompter).toHaveBeenCalledOnce();
    expect(result.options.workflowMode).toBe("single-agent");
    expect(result.options.externalSkillSet).toBe("full");
    expect(result.options.performance).toBe(true);
    expect(result.options.routes).toEqual(["/", "/dashboard"]);
  });

  it("skips the interactive installer when --yes is used", async () => {
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

    const prompter = vi.fn(async () => ({
      workflowMode: "single-agent" as const,
      externalSkillSet: "full" as const,
      performance: true,
      routes: ["/", "/dashboard"]
    }));

    const result = await runInitCommand(
      {
        yes: true,
        performance: false,
        routes: [],
        externalSkillSet: "recommended",
        workflowMode: "multi-agent",
        overwriteManaged: false,
        dryRun: true,
        help: false
      },
      { cwd: rootDir, prompter }
    );

    expect(result.exitCode).toBe(0);
    expect(prompter).not.toHaveBeenCalled();
    expect(result.options.workflowMode).toBe("multi-agent");
    expect(result.options.externalSkillSet).toBe("recommended");
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
        workflowMode: "multi-agent",
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
