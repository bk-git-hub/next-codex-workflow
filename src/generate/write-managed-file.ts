import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { pathExists, resolveFrom } from "../utils/fs.js";
import { MANAGED_FILE_MARKER, type GeneratedFile, type WriteAction } from "./types.js";

export interface PreparedWrite {
  action: WriteAction;
  absolutePath: string;
  content: string;
}

export async function prepareManagedWrite(
  rootDir: string,
  file: GeneratedFile,
  options: { overwriteManaged: boolean; managedPaths: Set<string> }
): Promise<{ ok: true; preparedWrite: PreparedWrite } | { ok: false; conflictPath: string }> {
  const absolutePath = resolveFrom(rootDir, file.relativePath);
  const exists = await pathExists(absolutePath);

  if (!exists) {
    return {
      ok: true,
      preparedWrite: {
        action: { kind: "create", relativePath: file.relativePath },
        absolutePath,
        content: file.content
      }
    };
  }

  const existingContent = await readFile(absolutePath, "utf8");
  const isManaged =
    existingContent.includes(MANAGED_FILE_MARKER) || options.managedPaths.has(file.relativePath);

  if (!isManaged) {
    return {
      ok: false,
      conflictPath: file.relativePath
    };
  }

  // Unchanged managed files should remain idempotent without requiring an override flag.
  if (existingContent === file.content) {
    return {
      ok: true,
      preparedWrite: {
        action: { kind: "overwrite", relativePath: file.relativePath },
        absolutePath,
        content: file.content
      }
    };
  }

  if (!options.overwriteManaged) {
    return {
      ok: false,
      conflictPath: file.relativePath
    };
  }

  return {
    ok: true,
    preparedWrite: {
      action: { kind: "overwrite", relativePath: file.relativePath },
      absolutePath,
      content: file.content
    }
  };
}

export async function commitManagedWrite(write: PreparedWrite): Promise<void> {
  await mkdir(path.dirname(write.absolutePath), { recursive: true });
  await writeFile(write.absolutePath, write.content, "utf8");
}
