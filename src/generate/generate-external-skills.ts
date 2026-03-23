import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import approvedExternalSkills from "../../manifest/approved-external-skills.json";
import type { GenerationContext, GeneratedFile } from "./types.js";
import { pathExists } from "../utils/fs.js";

interface ExternalSkillMetadata {
  name: string;
  source: string;
  pin: string;
  policy: "core-implicit" | "explicit-only" | "disabled-unless-enabled";
  preset: "core" | "recommended" | "optional";
}

async function packageRootFromImportMeta(): Promise<string> {
  let currentDirectory = path.dirname(fileURLToPath(import.meta.url));

  while (true) {
    if (await pathExists(path.join(currentDirectory, "vendor-skills"))) {
      return currentDirectory;
    }

    const parentDirectory = path.dirname(currentDirectory);

    if (parentDirectory === currentDirectory) {
      throw new Error("Unable to locate vendor-skills in the package root.");
    }

    currentDirectory = parentDirectory;
  }
}

function shouldIncludeSkill(skill: ExternalSkillMetadata, context: GenerationContext): boolean {
  if (skill.preset === "core") {
    return true;
  }

  if (skill.preset === "recommended") {
    return context.options.externalSkillSet === "recommended" || context.options.externalSkillSet === "full";
  }

  return (
    context.options.externalSkillSet === "full" &&
    skill.name === "next-cache-components" &&
    (context.inspection.next.nextMajor ?? 0) >= 16 &&
    context.inspection.router.appRouter &&
    (context.options.performance || context.options.externalSkillSet === "full")
  );
}

async function collectVendorFiles(rootDir: string, relativeDirectory = ""): Promise<string[]> {
  const directoryPath = path.join(rootDir, relativeDirectory);
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryRelativePath = relativeDirectory ? path.join(relativeDirectory, entry.name) : entry.name;

    if (entry.isDirectory()) {
      files.push(...(await collectVendorFiles(rootDir, entryRelativePath)));
      continue;
    }

    files.push(entryRelativePath);
  }

  return files;
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

export async function generateExternalSkillFiles(
  context: GenerationContext
): Promise<{ files: GeneratedFile[]; installedSkills: ExternalSkillMetadata[] }> {
  const packageRoot = await packageRootFromImportMeta();
  const selectedSkills = (approvedExternalSkills.skills as ExternalSkillMetadata[]).filter((skill) =>
    shouldIncludeSkill(skill, context)
  );
  const files: GeneratedFile[] = [];

  for (const skill of selectedSkills) {
    const vendorRoot = path.join(packageRoot, "vendor-skills", skill.name);
    const vendorFiles = await collectVendorFiles(vendorRoot);

    for (const vendorFile of vendorFiles) {
      const absoluteSourcePath = path.join(vendorRoot, vendorFile);
      const content = await readFile(absoluteSourcePath, "utf8");

      files.push({
        relativePath: `.agents/skills/${skill.name}/${toPosixPath(vendorFile)}`,
        content
      });
    }
  }

  return {
    files,
    installedSkills: selectedSkills
  };
}

export function generateSkillsLockFile(skills: ExternalSkillMetadata[]): GeneratedFile | null {
  if (skills.length === 0) {
    return null;
  }

  return {
    relativePath: "agent-workflow/manifest/skills-lock.json",
    content: `${JSON.stringify(
      {
        version: 1,
        skills: skills.map((skill) => ({
          name: skill.name,
          source: skill.source,
          pin: skill.pin,
          policy: skill.policy
        }))
      },
      null,
      2
    )}\n`
  };
}
