import { readdir, readFile } from "node:fs/promises";

import approvedExternalSkills from "../../manifest/approved-external-skills.json";
import type { ExternalSkillSet, InitOptions, WorkflowMode } from "../cli/commands/init.js";
import { PACKAGE_VERSION } from "../package-version.js";
import { pathExists, resolveFrom } from "../utils/fs.js";
import { resolvePerformanceRoutes } from "./generate-performance-files.js";
import type { GeneratedFile, GenerationContext } from "./types.js";
import { MANAGED_FILE_MARKER } from "./types.js";
import { MANAGED_REGISTRY_PATH } from "./managed-registry.js";

export const INSTALL_STATE_PATH = "agent-workflow/manifest/install-state.json";

export interface SavedInstallOptions {
  performance: boolean;
  routes: string[];
  externalSkillSet: ExternalSkillSet;
  workflowMode: WorkflowMode;
}

interface InstallState {
  _generatedBy: string;
  version: number;
  packageVersion: string;
  options: SavedInstallOptions;
}

export interface ResolvedInstallState {
  options: SavedInstallOptions;
  source: "manifest" | "inferred";
  warnings: string[];
}

const recommendedSkillNames = new Set(
  approvedExternalSkills.skills
    .filter((skill) => skill.preset === "recommended")
    .map((skill) => skill.name)
);

const optionalSkillNames = new Set(
  approvedExternalSkills.skills.filter((skill) => skill.preset === "optional").map((skill) => skill.name)
);

function normalizeRoutes(routes: string[]): string[] {
  return [...new Set(routes.map((route) => route.trim()).filter(Boolean))];
}

function isExternalSkillSet(value: unknown): value is ExternalSkillSet {
  return value === "minimal" || value === "recommended" || value === "full";
}

function isWorkflowMode(value: unknown): value is WorkflowMode {
  return value === "single-agent" || value === "multi-agent";
}

function isSavedInstallOptions(value: unknown): value is SavedInstallOptions {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeOptions = value as Partial<SavedInstallOptions>;

  return (
    typeof maybeOptions.performance === "boolean" &&
    Array.isArray(maybeOptions.routes) &&
    maybeOptions.routes.every((route) => typeof route === "string") &&
    isExternalSkillSet(maybeOptions.externalSkillSet) &&
    isWorkflowMode(maybeOptions.workflowMode)
  );
}

function serializeInstallState(options: SavedInstallOptions): string {
  return JSON.stringify(
    {
      _generatedBy: MANAGED_FILE_MARKER,
      version: 1,
      packageVersion: PACKAGE_VERSION,
      options: {
        performance: options.performance,
        routes: normalizeRoutes(options.routes),
        externalSkillSet: options.externalSkillSet,
        workflowMode: options.workflowMode
      }
    },
    null,
    2
  );
}

export function generateInstallStateFile(
  context: GenerationContext
): GeneratedFile {
  const routes = context.options.performance ? resolvePerformanceRoutes(context) : [];

  return {
    relativePath: INSTALL_STATE_PATH,
    content: `${serializeInstallState({
      performance: context.options.performance,
      routes,
      externalSkillSet: context.options.externalSkillSet,
      workflowMode: context.options.workflowMode
    })}\n`
  };
}

export async function loadInstallState(rootDir: string): Promise<ResolvedInstallState | null> {
  const installStatePath = resolveFrom(rootDir, INSTALL_STATE_PATH);

  if (!(await pathExists(installStatePath))) {
    return null;
  }

  try {
    const raw = await readFile(installStatePath, "utf8");
    const parsed = JSON.parse(raw) as InstallState;

    if (parsed._generatedBy !== MANAGED_FILE_MARKER || !isSavedInstallOptions(parsed.options)) {
      return null;
    }

    return {
      options: {
        performance: parsed.options.performance,
        routes: normalizeRoutes(parsed.options.routes),
        externalSkillSet: parsed.options.externalSkillSet,
        workflowMode: parsed.options.workflowMode
      },
      source: "manifest",
      warnings: []
    };
  } catch {
    return null;
  }
}

async function inferExternalSkillSet(rootDir: string): Promise<{
  externalSkillSet: ExternalSkillSet;
  warnings: string[];
}> {
  const warnings: string[] = [];
  const skillNames = new Set<string>();
  const skillsLockPath = resolveFrom(rootDir, "agent-workflow", "manifest", "skills-lock.json");

  if (await pathExists(skillsLockPath)) {
    try {
      const raw = await readFile(skillsLockPath, "utf8");
      const parsed = JSON.parse(raw) as { skills?: Array<{ name?: string }> };

      for (const skill of parsed.skills ?? []) {
        if (typeof skill.name === "string") {
          skillNames.add(skill.name);
        }
      }
    } catch {
      warnings.push(
        "Could not read agent-workflow/manifest/skills-lock.json, so the external skill set was inferred from the installed skill directories."
      );
    }
  }

  if (skillNames.size === 0) {
    const skillsDirectory = resolveFrom(rootDir, ".agents", "skills");

    if (await pathExists(skillsDirectory)) {
      const entries = await readdir(skillsDirectory, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          skillNames.add(entry.name);
        }
      }
    }
  }

  if ([...skillNames].some((skillName) => optionalSkillNames.has(skillName))) {
    return {
      externalSkillSet: "full",
      warnings
    };
  }

  if ([...skillNames].some((skillName) => recommendedSkillNames.has(skillName))) {
    return {
      externalSkillSet: "recommended",
      warnings
    };
  }

  if (skillNames.size > 0) {
    return {
      externalSkillSet: "minimal",
      warnings
    };
  }

  return {
    externalSkillSet: "recommended",
    warnings: [
      ...warnings,
      "Could not infer the installed external skill set from the current repository. Update will default to the recommended preset."
    ]
  };
}

async function inferPerformanceEnabled(rootDir: string): Promise<boolean> {
  const performanceMarkers = [
    resolveFrom(rootDir, "scripts", "run-lighthouse.mjs"),
    resolveFrom(rootDir, "agent-workflow", "artifacts", "PERF.md"),
    resolveFrom(rootDir, "agent-workflow", "config", "lighthouserc.cjs")
  ];

  for (const markerPath of performanceMarkers) {
    if (await pathExists(markerPath)) {
      return true;
    }
  }

  return false;
}

async function inferPerformanceRoutes(rootDir: string): Promise<{ routes: string[]; warnings: string[] }> {
  const scriptPath = resolveFrom(rootDir, "scripts", "run-lighthouse.mjs");

  if (!(await pathExists(scriptPath))) {
    return { routes: [], warnings: [] };
  }

  try {
    const raw = await readFile(scriptPath, "utf8");
    const match = raw.match(/const ROUTES = (\[[\s\S]*?\]);/);

    if (!match) {
      return {
        routes: [],
        warnings: [
          "Could not recover performance routes from scripts/run-lighthouse.mjs. Update will fall back to repository-discovered routes."
        ]
      };
    }

    const parsed = JSON.parse(match[1]) as unknown;

    if (!Array.isArray(parsed) || !parsed.every((route) => typeof route === "string")) {
      return {
        routes: [],
        warnings: [
          "Recovered invalid performance routes from scripts/run-lighthouse.mjs. Update will fall back to repository-discovered routes."
        ]
      };
    }

    return {
      routes: normalizeRoutes(parsed),
      warnings: []
    };
  } catch {
    return {
      routes: [],
      warnings: [
        "Could not parse scripts/run-lighthouse.mjs. Update will fall back to repository-discovered routes."
      ]
    };
  }
}

async function inferWorkflowMode(rootDir: string): Promise<{ workflowMode: WorkflowMode; warnings: string[] }> {
  const planFeaturePath = resolveFrom(rootDir, ".agents", "skills", "plan-feature", "SKILL.md");

  if (!(await pathExists(planFeaturePath))) {
    return {
      workflowMode: "multi-agent",
      warnings: [
        "Could not infer the workflow mode because .agents/skills/plan-feature/SKILL.md is missing. Update will default to multi-agent."
      ]
    };
  }

  try {
    const raw = await readFile(planFeaturePath, "utf8");

    if (raw.includes("This repository uses the single-agent workflow mode.")) {
      return {
        workflowMode: "single-agent",
        warnings: []
      };
    }

    if (raw.includes("This skill requires Codex multi-agent.")) {
      return {
        workflowMode: "multi-agent",
        warnings: []
      };
    }
  } catch {
    return {
      workflowMode: "multi-agent",
      warnings: [
        "Could not read .agents/skills/plan-feature/SKILL.md. Update will default to multi-agent."
      ]
    };
  }

  return {
    workflowMode: "multi-agent",
    warnings: [
      "Could not infer the workflow mode from the generated plan-feature skill. Update will default to multi-agent."
    ]
  };
}

export async function resolveInstallState(rootDir: string): Promise<ResolvedInstallState | null> {
  const manifestState = await loadInstallState(rootDir);

  if (manifestState) {
    return manifestState;
  }

  const hasManagedRegistry = await pathExists(resolveFrom(rootDir, MANAGED_REGISTRY_PATH));
  const hasSkillsLock = await pathExists(resolveFrom(rootDir, "agent-workflow", "manifest", "skills-lock.json"));
  const hasCodexConfig = await pathExists(resolveFrom(rootDir, ".codex", "config.toml"));

  if (!hasManagedRegistry && !hasSkillsLock && !hasCodexConfig) {
    return null;
  }

  const performance = await inferPerformanceEnabled(rootDir);
  const routeInference = performance ? await inferPerformanceRoutes(rootDir) : { routes: [], warnings: [] };
  const skillSetInference = await inferExternalSkillSet(rootDir);
  const workflowModeInference = await inferWorkflowMode(rootDir);

  return {
    options: {
      performance,
      routes: routeInference.routes,
      externalSkillSet: skillSetInference.externalSkillSet,
      workflowMode: workflowModeInference.workflowMode
    },
    source: "inferred",
    warnings: [
      "No install-state manifest was found. Update inferred the existing workflow options from the generated files in this repository.",
      ...routeInference.warnings,
      ...skillSetInference.warnings,
      ...workflowModeInference.warnings
    ]
  };
}
