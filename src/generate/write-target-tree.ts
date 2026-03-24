import { generateAgentFiles } from "./generate-agent-files.js";
import { generateAgentsMd } from "./generate-agents-md.js";
import { generateArtifacts } from "./generate-artifacts.js";
import { generateCodexConfig } from "./generate-codex-config.js";
import { generateExternalSkillFiles, generateSkillsLockFile } from "./generate-external-skills.js";
import { generateInstallStateFile } from "./install-state.js";
import { generateInternalSkills } from "./generate-internal-skills.js";
import { generatePerformanceFiles } from "./generate-performance-files.js";
import { generateVerifyScriptFiles } from "./generate-verify-script.js";
import type { GenerationContext, GeneratedFile, WriteAction } from "./types.js";
import { MANAGED_REGISTRY_PATH, loadManagedRegistry, serializeManagedRegistry } from "./managed-registry.js";
import { commitManagedWrite, prepareManagedWrite } from "./write-managed-file.js";

async function buildTargetFiles(context: GenerationContext): Promise<GeneratedFile[]> {
  const externalSkills = await generateExternalSkillFiles(context);
  const skillsLockFile = generateSkillsLockFile(externalSkills.installedSkills);
  const files: GeneratedFile[] = [
    generateAgentsMd(context),
    generateCodexConfig(),
    ...generateAgentFiles(),
    ...generateInternalSkills(context),
    ...generateVerifyScriptFiles(),
    ...generateArtifacts(),
    ...externalSkills.files,
    generateInstallStateFile(context)
  ];

  if (skillsLockFile) {
    files.push(skillsLockFile);
  }

  if (context.options.performance) {
    files.push(...generatePerformanceFiles(context));
  }

  return files;
}

export async function writeTargetTree(
  rootDir: string,
  context: GenerationContext,
  options: { dryRun: boolean; overwriteManaged: boolean }
): Promise<{ ok: true; actions: WriteAction[] } | { ok: false; conflictPaths: string[] }> {
  const managedPaths = await loadManagedRegistry(rootDir);
  const preparedWrites = [];
  const conflictPaths: string[] = [];

  for (const file of await buildTargetFiles(context)) {
    const prepared = await prepareManagedWrite(rootDir, file, {
      overwriteManaged: options.overwriteManaged,
      managedPaths
    });

    if (!prepared.ok) {
      conflictPaths.push(prepared.conflictPath);
      continue;
    }

    preparedWrites.push(prepared.preparedWrite);
  }

  if (conflictPaths.length > 0) {
    return {
      ok: false,
      conflictPaths
    };
  }

  const managedRegistryPaths = [...new Set([...preparedWrites.map((write) => write.action.relativePath), MANAGED_REGISTRY_PATH])].sort();
  const registryWrite = await prepareManagedWrite(
    rootDir,
    {
      relativePath: MANAGED_REGISTRY_PATH,
      content: `${serializeManagedRegistry(managedRegistryPaths)}\n`
    },
    {
      overwriteManaged: true,
      managedPaths
    }
  );

  if (!registryWrite.ok) {
    return {
      ok: false,
      conflictPaths: [registryWrite.conflictPath]
    };
  }

  preparedWrites.push(registryWrite.preparedWrite);

  if (!options.dryRun) {
    for (const preparedWrite of preparedWrites) {
      await commitManagedWrite(preparedWrite);
    }
  }

  return {
    ok: true,
    actions: preparedWrites.map((write) => write.action)
  };
}
