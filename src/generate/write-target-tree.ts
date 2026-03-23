import { generateAgentFiles } from "./generate-agent-files.js";
import { generateAgentsMd } from "./generate-agents-md.js";
import { generateArtifacts } from "./generate-artifacts.js";
import { generateCodexConfig } from "./generate-codex-config.js";
import { generateInternalSkills } from "./generate-internal-skills.js";
import { generateVerifyScriptFiles } from "./generate-verify-script.js";
import type { GenerationContext, GeneratedFile, WriteAction } from "./types.js";
import { commitManagedWrite, prepareManagedWrite } from "./write-managed-file.js";

function buildTargetFiles(context: GenerationContext): GeneratedFile[] {
  return [
    generateAgentsMd(context),
    generateCodexConfig(),
    ...generateAgentFiles(),
    ...generateInternalSkills(),
    ...generateVerifyScriptFiles(),
    ...generateArtifacts()
  ];
}

export async function writeTargetTree(
  rootDir: string,
  context: GenerationContext,
  options: { dryRun: boolean; overwriteManaged: boolean }
): Promise<{ ok: true; actions: WriteAction[] } | { ok: false; conflictPaths: string[] }> {
  const preparedWrites = [];
  const conflictPaths: string[] = [];

  for (const file of buildTargetFiles(context)) {
    const prepared = await prepareManagedWrite(rootDir, file, {
      overwriteManaged: options.overwriteManaged
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
