import { access } from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function resolveFrom(rootDir: string, ...segments: string[]): string {
  return path.join(rootDir, ...segments);
}
