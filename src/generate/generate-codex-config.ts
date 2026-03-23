import codexConfigTemplate from "../templates/codex/config.toml.hbs";
import { renderTemplate } from "./render-template.js";
import type { GeneratedFile } from "./types.js";

export function generateCodexConfig(): GeneratedFile {
  return {
    relativePath: ".codex/config.toml",
    content: renderTemplate(codexConfigTemplate, {})
  };
}
