import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { ClientModule } from "./index";
import { paths } from "../utils/paths";
import { detectBinary } from "./index";
import { addToTomlConfig, createTomlConfig } from "../utils/toml";

export const codex: ClientModule = {
  id: "codex",
  name: "OpenAI Codex CLI",
  configPaths: () => paths.codex(),
  format: "toml",

  serverEntry(apiKey: string) {
    return {
      config: {
        command: "npx",
        args: ["-y", "@letretro/mcp"],
      },
      env: { LETRETRO_API_KEY: apiKey },
    };
  },

  detect() {
    return detectBinary("codex");
  },
};

export function writeCodexConfig(configPath: string, apiKey: string): void {
  const dir = dirname(configPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  let content: string;
  if (existsSync(configPath)) {
    const existing = readFileSync(configPath, "utf-8");
    content = addToTomlConfig(existing, "letretro", {
      command: "npx",
      args: ["-y", "@letretro/mcp"],
    }, { LETRETRO_API_KEY: apiKey });
  } else {
    content = createTomlConfig("letretro", {
      command: "npx",
      args: ["-y", "@letretro/mcp"],
    }, { LETRETRO_API_KEY: apiKey });
  }

  writeFileSync(configPath, content, "utf-8");
}
