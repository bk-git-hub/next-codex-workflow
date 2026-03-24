import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export interface CodexMultiAgentStatus {
  configPath: string;
  enabled: boolean;
  exists: boolean;
}

function extractFeaturesSection(rawConfig: string): string | null {
  const lines = rawConfig.split(/\r?\n/);
  const featuresStart = lines.findIndex((line) => line.trim() === "[features]");

  if (featuresStart === -1) {
    return null;
  }

  const sectionLines: string[] = [];

  for (let index = featuresStart + 1; index < lines.length; index += 1) {
    const line = lines[index];

    if (line.trim().startsWith("[") && line.trim().endsWith("]")) {
      break;
    }

    sectionLines.push(line);
  }

  return sectionLines.join("\n");
}

export async function detectCodexMultiAgent(homeDirectory: string = os.homedir()): Promise<CodexMultiAgentStatus> {
  const configPath = path.join(homeDirectory, ".codex", "config.toml");

  try {
    const rawConfig = await readFile(configPath, "utf8");
    const featuresSection = extractFeaturesSection(rawConfig);
    const enabled = featuresSection ? /^\s*multi_agent\s*=\s*true\s*$/m.test(featuresSection) : false;

    return {
      configPath,
      enabled,
      exists: true
    };
  } catch {
    return {
      configPath,
      enabled: false,
      exists: false
    };
  }
}
