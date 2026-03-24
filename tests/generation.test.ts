import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

import { afterEach, describe, expect, it } from "vitest";

import { runInitCommand } from "../src/cli/commands/init.js";

const createdDirectories: string[] = [];

async function createTempRepository(): Promise<string> {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "next-codex-workflow-generate-"));
  createdDirectories.push(tempRoot);
  return tempRoot;
}

async function createSupportedRepository(rootDir: string): Promise<void> {
  await writeFile(
    path.join(rootDir, "package.json"),
    JSON.stringify(
      {
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

async function runNodeCommand(command: string, args: string[], cwd: string): Promise<{
  exitCode: number;
  stdout: string;
  stderr: string;
}> {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", reject);
    child.on("close", (code) => {
      resolve({
        exitCode: code ?? 1,
        stdout,
        stderr
      });
    });
  });
}

afterEach(async () => {
  await Promise.all(createdDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("workflow file generation", () => {
  it("writes the core managed files for a supported repository", async () => {
    const rootDir = await createTempRepository();
    await createSupportedRepository(rootDir);

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

    expect(result.exitCode).toBe(0);

    const agentsMd = await readFile(path.join(rootDir, "AGENTS.md"), "utf8");
    const codexConfig = await readFile(path.join(rootDir, ".codex", "config.toml"), "utf8");
    const plannerAgent = await readFile(path.join(rootDir, ".codex", "agents", "planner.toml"), "utf8");
    const executorAgent = await readFile(path.join(rootDir, ".codex", "agents", "executor.toml"), "utf8");
    const testerAgent = await readFile(path.join(rootDir, ".codex", "agents", "tester.toml"), "utf8");
    const verifierAgent = await readFile(path.join(rootDir, ".codex", "agents", "verifier.toml"), "utf8");
    const reviewerAgent = await readFile(path.join(rootDir, ".codex", "agents", "reviewer.toml"), "utf8");
    const verifyScript = await readFile(path.join(rootDir, "scripts", "verify-agent-workflow.mjs"), "utf8");
    const planArtifact = await readFile(path.join(rootDir, "agent-workflow", "artifacts", "PLAN.md"), "utf8");
    const managedRegistry = await readFile(
      path.join(rootDir, "agent-workflow", "manifest", "managed-files.json"),
      "utf8"
    );
    const installState = await readFile(
      path.join(rootDir, "agent-workflow", "manifest", "install-state.json"),
      "utf8"
    );
    const skillsLock = await readFile(
      path.join(rootDir, "agent-workflow", "manifest", "skills-lock.json"),
      "utf8"
    );
    const skillFile = await readFile(
      path.join(rootDir, ".agents", "skills", "task-clarification", "SKILL.md"),
      "utf8"
    );
    const externalSkillFile = await readFile(
      path.join(rootDir, ".agents", "skills", "next-best-practices", "SKILL.md"),
      "utf8"
    );
    const planFeatureSkill = await readFile(
      path.join(rootDir, ".agents", "skills", "plan-feature", "SKILL.md"),
      "utf8"
    );
    await expect(
      readFile(path.join(rootDir, ".agents", "skills", "implementation-strategy", "agents", "openai.yaml"), "utf8")
    ).rejects.toThrow();
    const verifyFeatureSkill = await readFile(
      path.join(rootDir, ".agents", "skills", "verify-feature", "SKILL.md"),
      "utf8"
    );
    const reviewFeatureSkill = await readFile(
      path.join(rootDir, ".agents", "skills", "review-feature", "SKILL.md"),
      "utf8"
    );
    const buildFeatureSkill = await readFile(
      path.join(rootDir, ".agents", "skills", "build-feature", "SKILL.md"),
      "utf8"
    );
    const buildFeatureMetadata = await readFile(
      path.join(rootDir, ".agents", "skills", "build-feature", "agents", "openai.yaml"),
      "utf8"
    );
    const externalSkillReference = await readFile(
      path.join(rootDir, ".agents", "skills", "next-best-practices", "file-conventions.md"),
      "utf8"
    );
    const reactRule = await readFile(
      path.join(rootDir, ".agents", "skills", "vercel-react-best-practices", "rules", "async-parallel.md"),
      "utf8"
    );
    const componentReference = await readFile(
      path.join(rootDir, ".agents", "skills", "building-components", "references", "principles.mdx"),
      "utf8"
    );
    const vitestSkill = await readFile(path.join(rootDir, ".agents", "skills", "vitest", "SKILL.md"), "utf8");
    const playwrightBestPracticesSkill = await readFile(
      path.join(rootDir, ".agents", "skills", "playwright-best-practices", "SKILL.md"),
      "utf8"
    );
    const playwrightCliSkill = await readFile(
      path.join(rootDir, ".agents", "skills", "playwright-cli", "SKILL.md"),
      "utf8"
    );
    const playwrightBestPracticesReference = await readFile(
      path.join(rootDir, ".agents", "skills", "playwright-best-practices", "frameworks", "nextjs.md"),
      "utf8"
    );
    const playwrightCliReference = await readFile(
      path.join(rootDir, ".agents", "skills", "playwright-cli", "references", "test-generation.md"),
      "utf8"
    );
    const designGuidelineReference = await readFile(
      path.join(
        rootDir,
        ".agents",
        "skills",
        "web-design-guidelines",
        "references",
        "web-interface-guidelines.md"
      ),
      "utf8"
    );

    expect(agentsMd).toContain("Generated by next-codex-workflow-kit");
    expect(agentsMd).toContain("# Feature Work Routing Rules");
    expect(agentsMd).toContain("`executor`");
    expect(agentsMd).toContain("`tester`");
    expect(codexConfig).toContain("[agents.executor]");
    expect(codexConfig).toContain("[agents.tester]");
    expect(codexConfig).toContain("[agents.verifier]");
    expect(plannerAgent).toContain(".agents/skills/next-best-practices");
    expect(plannerAgent).toContain(".agents/skills/vitest");
    expect(executorAgent).toContain('name = "executor"');
    expect(executorAgent).toContain(".agents/skills/vercel-react-best-practices");
    expect(executorAgent).toContain(".agents/skills/playwright-best-practices");
    expect(testerAgent).toContain('name = "tester"');
    expect(testerAgent).toContain(".agents/skills/vitest");
    expect(testerAgent).toContain("prefer Playwright for async Server Component-heavy flows");
    expect(verifierAgent).toContain(".agents/skills/next-best-practices");
    expect(reviewerAgent).toContain(".agents/skills/next-best-practices");
    expect(verifyScript).toContain("CHECK_ORDER");
    expect(planArtifact).toContain("# Task Summary");
    expect(managedRegistry).toContain("\"paths\"");
    expect(installState).toContain("\"externalSkillSet\": \"recommended\"");
    expect(installState).toContain("\"performance\": false");
    expect(skillsLock).toContain("\"next-best-practices\"");
    expect(skillsLock).toContain("\"vitest\"");
    expect(skillsLock).toContain("\"playwright-best-practices\"");
    expect(skillFile).toContain("name: task-clarification");
    expect(planFeatureSkill).toContain("Spawn the agent named `planner` now");
    expect(planFeatureSkill).toContain("run `/multi-agent`");
    expect(verifyFeatureSkill).toContain("Spawn the agent named `verifier` now");
    expect(reviewFeatureSkill).toContain("Spawn the agent named `reviewer` now");
    expect(buildFeatureSkill).toContain("Spawn the agent named `tester` now");
    expect(buildFeatureMetadata).toContain("agent named executor immediately");
    expect(buildFeatureMetadata).toContain("agent named tester");
    expect(buildFeatureMetadata).toContain("repo-local quality skills");
    expect(externalSkillFile).toContain("name: next-best-practices");
    expect(externalSkillReference).toContain("## Project Structure");
    expect(reactRule).toContain("Promise.all()");
    expect(componentReference).toContain("## Composability and Reusability");
    expect(vitestSkill).toContain("name: vitest");
    expect(playwrightBestPracticesSkill).toContain("name: playwright-best-practices");
    expect(playwrightCliSkill).toContain("name: playwright-cli");
    expect(playwrightBestPracticesReference).toContain("Next.js");
    expect(playwrightCliReference).toContain("# Test Generation");
    expect(designGuidelineReference).toContain("### Accessibility");
  });

  it("does not write files during dry run", async () => {
    const rootDir = await createTempRepository();
    await createSupportedRepository(rootDir);

    const result = await runInitCommand(
      {
        yes: false,
        performance: false,
        routes: [],
        externalSkillSet: "recommended",
        overwriteManaged: false,
        dryRun: true,
        help: false
      },
      { cwd: rootDir }
    );

    expect(result.exitCode).toBe(0);
    await expect(readFile(path.join(rootDir, "AGENTS.md"), "utf8")).rejects.toThrow();
    expect(result.actions.some((action) => action.endsWith("AGENTS.md"))).toBe(true);
  });

  it("fails with exit code 3 when an unmanaged target file already exists", async () => {
    const rootDir = await createTempRepository();
    await createSupportedRepository(rootDir);
    await writeFile(path.join(rootDir, "AGENTS.md"), "# User-owned file\n");

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

    expect(result.exitCode).toBe(3);
    expect(result.error).toContain("AGENTS.md");
  });

  it("still blocks unmanaged files when overwriteManaged is enabled", async () => {
    const rootDir = await createTempRepository();
    await createSupportedRepository(rootDir);
    await writeFile(path.join(rootDir, "AGENTS.md"), "# User-owned file\n");

    const result = await runInitCommand(
      {
        yes: false,
        performance: false,
        routes: [],
        externalSkillSet: "recommended",
        overwriteManaged: true,
        dryRun: false,
        help: false
      },
      { cwd: rootDir }
    );

    const agentsMd = await readFile(path.join(rootDir, "AGENTS.md"), "utf8");

    expect(result.exitCode).toBe(3);
    expect(result.error).toContain("AGENTS.md");
    expect(agentsMd).toBe("# User-owned file\n");
  });

  it("is idempotent when init runs twice with the same options", async () => {
    const rootDir = await createTempRepository();
    await createSupportedRepository(rootDir);

    const firstRun = await runInitCommand(
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

    expect(firstRun.exitCode).toBe(0);

    const firstAgentsMd = await readFile(path.join(rootDir, "AGENTS.md"), "utf8");

    const secondRun = await runInitCommand(
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

    const secondAgentsMd = await readFile(path.join(rootDir, "AGENTS.md"), "utf8");

    expect(secondRun.exitCode).toBe(0);
    expect(secondAgentsMd).toBe(firstAgentsMd);
  });

  it("requires overwriteManaged to replace a changed managed file", async () => {
    const rootDir = await createTempRepository();
    await createSupportedRepository(rootDir);

    const firstRun = await runInitCommand(
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

    expect(firstRun.exitCode).toBe(0);

    const agentsPath = path.join(rootDir, "AGENTS.md");
    const originalAgentsMd = await readFile(agentsPath, "utf8");

    await writeFile(agentsPath, `${originalAgentsMd}\n<!-- user edit -->\n`);

    const blockedRun = await runInitCommand(
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

    expect(blockedRun.exitCode).toBe(3);

    const preservedAgentsMd = await readFile(agentsPath, "utf8");
    expect(preservedAgentsMd).toContain("user edit");

    const overwriteRun = await runInitCommand(
      {
        yes: false,
        performance: false,
        routes: [],
        externalSkillSet: "recommended",
        overwriteManaged: true,
        dryRun: false,
        help: false
      },
      { cwd: rootDir }
    );

    const restoredAgentsMd = await readFile(agentsPath, "utf8");

    expect(overwriteRun.exitCode).toBe(0);
    expect(restoredAgentsMd).toBe(originalAgentsMd);
  });

  it("adds performance files only when performance mode is enabled", async () => {
    const rootDir = await createTempRepository();
    await createSupportedRepository(rootDir);

    const result = await runInitCommand(
      {
        yes: false,
        performance: true,
        routes: [],
        externalSkillSet: "recommended",
        overwriteManaged: false,
        dryRun: false,
        help: false
      },
      { cwd: rootDir }
    );

    expect(result.exitCode).toBe(0);

    const perfArtifact = await readFile(path.join(rootDir, "agent-workflow", "artifacts", "PERF.md"), "utf8");
    const lighthouseConfig = await readFile(
      path.join(rootDir, "agent-workflow", "config", "lighthouserc.cjs"),
      "utf8"
    );
    const lighthouseScript = await readFile(path.join(rootDir, "scripts", "run-lighthouse.mjs"), "utf8");
    const performanceSkill = await readFile(
      path.join(rootDir, ".agents", "skills", "performance-lighthouse-audit", "SKILL.md"),
      "utf8"
    );

    expect(perfArtifact).toContain("# Audited Routes");
    expect(lighthouseConfig).toContain('"/dashboard"');
    expect(lighthouseScript).toContain("auditedRoutes");
    expect(performanceSkill).toContain("name: performance-lighthouse-audit");
  });

  it("runs the local TypeScript fallback without shell quoting issues on Windows", async () => {
    const rootDir = await createTempRepository();
    await writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          name: "fixture-typecheck-fallback",
          dependencies: {
            next: "^16.0.0",
            react: "^19.0.0"
          },
          devDependencies: {
            typescript: "^5.9.0"
          },
          scripts: {}
        },
        null,
        2
      )
    );
    await writeFile(path.join(rootDir, "package-lock.json"), "");
    await writeFile(path.join(rootDir, "tsconfig.json"), "{}");
    await mkdir(path.join(rootDir, "app"), { recursive: true });
    await writeFile(path.join(rootDir, "app", "page.tsx"), "export default function Page() { return null; }");
    await mkdir(path.join(rootDir, "node_modules", "typescript", "bin"), { recursive: true });
    await writeFile(
      path.join(rootDir, "node_modules", "typescript", "bin", "tsc"),
      [
        "#!/usr/bin/env node",
        "process.stdout.write('fallback tsc ok\\n');"
      ].join("\n")
    );

    const initResult = await runInitCommand(
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

    expect(initResult.exitCode).toBe(0);

    const execution = await runNodeCommand(
      process.execPath,
      [path.join(rootDir, "scripts", "verify-agent-workflow.mjs")],
      rootDir
    );

    expect(execution.exitCode).toBe(0);

    const parsed = JSON.parse(execution.stdout);
    expect(parsed.blocking).toBe(false);
    expect(parsed.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "typecheck",
          status: "passed"
        })
      ])
    );

    const typecheckResult = parsed.results.find((result: { label: string }) => result.label === "typecheck");

    expect(typecheckResult.summary).toContain("fallback tsc ok");
  });

  it("selects external skills by preset and eligibility", async () => {
    const minimalRoot = await createTempRepository();
    await createSupportedRepository(minimalRoot);

    const minimalResult = await runInitCommand(
      {
        yes: false,
        performance: false,
        routes: [],
        externalSkillSet: "minimal",
        overwriteManaged: false,
        dryRun: false,
        help: false
      },
      { cwd: minimalRoot }
    );

    expect(minimalResult.exitCode).toBe(0);
    const minimalVitestSkill = await readFile(path.join(minimalRoot, ".agents", "skills", "vitest", "SKILL.md"), "utf8");
    const minimalPlaywrightSkill = await readFile(
      path.join(minimalRoot, ".agents", "skills", "playwright-best-practices", "SKILL.md"),
      "utf8"
    );
    await expect(
      readFile(path.join(minimalRoot, ".agents", "skills", "web-design-guidelines", "SKILL.md"), "utf8")
    ).rejects.toThrow();
    await expect(
      readFile(path.join(minimalRoot, ".agents", "skills", "playwright-cli", "SKILL.md"), "utf8")
    ).rejects.toThrow();
    expect(minimalVitestSkill).toContain("name: vitest");
    expect(minimalPlaywrightSkill).toContain("name: playwright-best-practices");

    const fullRoot = await createTempRepository();
    await createSupportedRepository(fullRoot);

    const fullResult = await runInitCommand(
      {
        yes: false,
        performance: true,
        routes: [],
        externalSkillSet: "full",
        overwriteManaged: false,
        dryRun: false,
        help: false
      },
      { cwd: fullRoot }
    );

    expect(fullResult.exitCode).toBe(0);

    const optionalSkill = await readFile(
      path.join(fullRoot, ".agents", "skills", "next-cache-components", "SKILL.md"),
      "utf8"
    );

    expect(optionalSkill).toContain("name: next-cache-components");
  });
});
