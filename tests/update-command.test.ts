import { mkdir, mkdtemp, readFile, rm, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runInitCommand } from "../src/cli/commands/init.js";
import { formatUpdateSummary, parseUpdateArgs, runUpdateCommand } from "../src/cli/commands/update.js";

const createdDirectories: string[] = [];

async function createTempRepository(): Promise<string> {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "next-codex-workflow-update-"));
  createdDirectories.push(tempRoot);
  return tempRoot;
}

async function createSupportedRepository(rootDir: string): Promise<void> {
  await writeFile(
    path.join(rootDir, "package.json"),
    JSON.stringify(
      {
        name: "fixture-update-app",
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
          typecheck: "tsc --noEmit"
        }
      },
      null,
      2
    )
  );
  await writeFile(path.join(rootDir, "package-lock.json"), "");
  await writeFile(path.join(rootDir, "tsconfig.json"), "{}");
  await mkdir(path.join(rootDir, "app"), { recursive: true });
  await writeFile(path.join(rootDir, "app", "page.tsx"), "export default function Page() { return null; }");
  await mkdir(path.join(rootDir, "app", "dashboard"), { recursive: true });
  await writeFile(
    path.join(rootDir, "app", "dashboard", "page.tsx"),
    "export default function Dashboard() { return null; }"
  );
}

afterEach(async () => {
  await Promise.all(createdDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("parseUpdateArgs", () => {
  it("parses the supported update flags", () => {
    const result = parseUpdateArgs(["--yes", "--dry-run"]);

    expect(result).toEqual({
      ok: true,
      options: {
        yes: true,
        dryRun: true,
        help: false
      }
    });
  });

  it("rejects unsupported update flags", () => {
    const result = parseUpdateArgs(["--performance"]);

    expect(result).toEqual({
      ok: false,
      error: "Unknown update option: --performance"
    });
  });
});

describe("runUpdateCommand", () => {
  it("refreshes changed managed files using the saved install-state manifest", async () => {
    const rootDir = await createTempRepository();
    await createSupportedRepository(rootDir);

    const initResult = await runInitCommand(
      {
        yes: false,
        performance: false,
        routes: [],
        externalSkillSet: "recommended",
        workflowMode: "multi-agent",
        autoCommit: false,
        overwriteManaged: false,
        dryRun: false,
        help: false
      },
      { cwd: rootDir }
    );

    expect(initResult.exitCode).toBe(0);

    const agentsPath = path.join(rootDir, "AGENTS.md");
    const originalAgentsMd = await readFile(agentsPath, "utf8");
    await writeFile(agentsPath, `${originalAgentsMd}\n<!-- changed after install -->\n`);

    const updateResult = await runUpdateCommand(
      {
        yes: false,
        dryRun: false,
        help: false
      },
      { cwd: rootDir }
    );

    expect(updateResult.exitCode).toBe(0);
    expect(updateResult.notes[0]).toContain("install-state.json");

    const restoredAgentsMd = await readFile(agentsPath, "utf8");
    expect(restoredAgentsMd).toBe(originalAgentsMd);
    expect(formatUpdateSummary(updateResult)).toContain("Command: update");
  });

  it("infers legacy install settings when the install-state manifest is missing", async () => {
    const rootDir = await createTempRepository();
    await createSupportedRepository(rootDir);

    const initResult = await runInitCommand(
      {
        yes: false,
        performance: true,
        routes: ["/", "/dashboard"],
        externalSkillSet: "full",
        workflowMode: "single-agent",
        autoCommit: true,
        overwriteManaged: false,
        dryRun: false,
        help: false
      },
      { cwd: rootDir }
    );

    expect(initResult.exitCode).toBe(0);

    await unlink(path.join(rootDir, "agent-workflow", "manifest", "install-state.json"));

    const updateResult = await runUpdateCommand(
      {
        yes: false,
        dryRun: false,
        help: false
      },
      { cwd: rootDir }
    );

    expect(updateResult.exitCode).toBe(0);
    expect(updateResult.options.performance).toBe(true);
    expect(updateResult.options.externalSkillSet).toBe("full");
    expect(updateResult.options.workflowMode).toBe("single-agent");
    expect(updateResult.options.autoCommit).toBe(true);
    expect(updateResult.options.routes).toEqual(["/", "/dashboard"]);
    expect(updateResult.warnings).toContain(
      "No install-state manifest was found. Update inferred the existing workflow options from the generated files in this repository."
    );

    const installState = await readFile(
      path.join(rootDir, "agent-workflow", "manifest", "install-state.json"),
      "utf8"
    );
    expect(installState).toContain('"externalSkillSet": "full"');
    expect(installState).toContain('"performance": true');
    expect(installState).toContain('"workflowMode": "single-agent"');
    expect(installState).toContain('"autoCommit": true');
  });

  it("infers the workflow mode from AGENTS.md when the plan shortcut file is unavailable", async () => {
    const rootDir = await createTempRepository();
    await createSupportedRepository(rootDir);

    const initResult = await runInitCommand(
      {
        yes: false,
        performance: false,
        routes: [],
        externalSkillSet: "recommended",
        workflowMode: "single-agent",
        autoCommit: false,
        overwriteManaged: false,
        dryRun: false,
        help: false
      },
      { cwd: rootDir }
    );

    expect(initResult.exitCode).toBe(0);

    await unlink(path.join(rootDir, "agent-workflow", "manifest", "install-state.json"));
    await unlink(path.join(rootDir, ".agents", "skills", "plan-feature", "SKILL.md"));

    const updateResult = await runUpdateCommand(
      {
        yes: false,
        dryRun: false,
        help: false
      },
      { cwd: rootDir }
    );

    expect(updateResult.exitCode).toBe(0);
    expect(updateResult.options.workflowMode).toBe("single-agent");
    expect(updateResult.options.autoCommit).toBe(false);
  });

  it("does not reopen the interactive installer during update", async () => {
    const rootDir = await createTempRepository();
    await createSupportedRepository(rootDir);

    const initResult = await runInitCommand(
      {
        yes: false,
        performance: false,
        routes: [],
        externalSkillSet: "recommended",
        workflowMode: "multi-agent",
        autoCommit: false,
        overwriteManaged: false,
        dryRun: false,
        help: false
      },
      { cwd: rootDir }
    );

    expect(initResult.exitCode).toBe(0);

    const prompter = vi.fn(async () => ({
      workflowMode: "single-agent" as const,
      externalSkillSet: "full" as const,
      performance: true,
      routes: ["/", "/dashboard"],
      autoCommit: true
    }));

    const updateResult = await runUpdateCommand(
      {
        yes: false,
        dryRun: true,
        help: false
      },
      { cwd: rootDir, prompter }
    );

    expect(updateResult.exitCode).toBe(0);
    expect(prompter).not.toHaveBeenCalled();
    expect(updateResult.options.workflowMode).toBe("multi-agent");
    expect(updateResult.options.externalSkillSet).toBe("recommended");
    expect(updateResult.options.performance).toBe(false);
    expect(updateResult.options.autoCommit).toBe(false);
  });

  it("fails when no existing workflow installation is present", async () => {
    const rootDir = await createTempRepository();
    await createSupportedRepository(rootDir);

    const updateResult = await runUpdateCommand(
      {
        yes: false,
        dryRun: false,
        help: false
      },
      { cwd: rootDir }
    );

    expect(updateResult.exitCode).toBe(4);
    expect(updateResult.error).toContain("Run `next-codex-workflow init` first.");
  });
});
