import { describe, expect, it } from "vitest";

import { formatInitSummary, parseInitArgs, runInitCommand } from "../src/cli/commands/init.js";

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
});

describe("runInitCommand", () => {
  it("returns a dry-run summary without writing files", async () => {
    const result = await runInitCommand({
      yes: false,
      performance: true,
      routes: ["/"],
      externalSkillSet: "recommended",
      overwriteManaged: false,
      dryRun: true,
      help: false
    });

    expect(result.exitCode).toBe(0);
    expect(result.mode).toBe("dry-run");
    expect(formatInitSummary(result)).toContain("Dry run requested. No files were written.");
  });
});
