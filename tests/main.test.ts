import { describe, expect, it, vi } from "vitest";

import { runCli } from "../src/cli/main.js";

describe("runCli", () => {
  it("prints help when no command is provided", async () => {
    const stdout = vi.fn();
    const stderr = vi.fn();

    const exitCode = await runCli([], { stdout, stderr });

    expect(exitCode).toBe(0);
    expect(stdout).toHaveBeenCalledOnce();
    expect(stderr).not.toHaveBeenCalled();
  });

  it("dispatches the init command", async () => {
    const stdout = vi.fn();
    const stderr = vi.fn();

    const exitCode = await runCli(["init", "--dry-run"], { stdout, stderr });

    expect(exitCode).toBe(0);
    expect(stdout).toHaveBeenCalledOnce();
    expect(String(stdout.mock.calls[0]?.[0])).toContain("Mode: dry-run");
    expect(stderr).not.toHaveBeenCalled();
  });
});
