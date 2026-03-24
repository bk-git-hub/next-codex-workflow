import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runCli } from "../src/cli/main.js";
import packageJson from "../package.json";

const createdDirectories: string[] = [];

async function createTempRepository(): Promise<string> {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "next-codex-workflow-cli-"));
  createdDirectories.push(tempRoot);
  return tempRoot;
}

afterEach(async () => {
  await Promise.all(createdDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("runCli", () => {
  it("prints help when no command is provided", async () => {
    const stdout = vi.fn();
    const stderr = vi.fn();

    const exitCode = await runCli([], { stdout, stderr });

    expect(exitCode).toBe(0);
    expect(stdout).toHaveBeenCalledOnce();
    expect(String(stdout.mock.calls[0]?.[0])).toContain("Global options:");
    expect(String(stdout.mock.calls[0]?.[0])).toContain("--version");
    expect(String(stdout.mock.calls[0]?.[0])).toContain("Init options:");
    expect(String(stdout.mock.calls[0]?.[0])).toContain("--help");
    expect(stderr).not.toHaveBeenCalled();
  });

  it("prints the current package version", async () => {
    const stdout = vi.fn();
    const stderr = vi.fn();

    const exitCode = await runCli(["--version"], { stdout, stderr });

    expect(exitCode).toBe(0);
    expect(stdout).toHaveBeenCalledWith(packageJson.version);
    expect(stderr).not.toHaveBeenCalled();
  });

  it("dispatches the init command", async () => {
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
            build: "next build"
          }
        },
        null,
        2
      )
    );
    await writeFile(path.join(rootDir, "package-lock.json"), "");
    await mkdir(path.join(rootDir, "app"), { recursive: true });
    await writeFile(path.join(rootDir, "app", "page.tsx"), "export default function Page() { return null; }");

    const stdout = vi.fn();
    const stderr = vi.fn();

    const exitCode = await runCli(["init", "--dry-run"], { stdout, stderr }, { cwd: rootDir });

    expect(exitCode).toBe(0);
    expect(stdout).toHaveBeenCalledOnce();
    expect(String(stdout.mock.calls[0]?.[0])).toContain("Mode: dry-run");
    expect(stderr).not.toHaveBeenCalled();
  });
});
