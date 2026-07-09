import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { ClientModule } from "./index";
import { paths } from "../utils/paths";
import { detectBinary, detectConfigFile } from "./index";
import { addToYamlConfig, createYamlConfig } from "../utils/yaml";

export const hermes: ClientModule = {
  id: "hermes",
  name: "Hermes",
  configPaths: () => paths.hermes(),
  format: "yaml",

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
    return detectBinary("hermes") || detectConfigFile(paths.hermes()) !== null;
  },
};

export function writeHermesConfig(configPath: string, apiKey: string): void {
  const dir = dirname(configPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  let content: string;
  if (existsSync(configPath)) {
    const existing = readFileSync(configPath, "utf-8");
    content = addToYamlConfig(existing, "letretro", "npx", ["-y", "@letretro/mcp"], { LETRETRO_API_KEY: apiKey });
  } else {
    content = createYamlConfig("letretro", "npx", ["-y", "@letretro/mcp"], { LETRETRO_API_KEY: apiKey });
  }

  writeFileSync(configPath, content, "utf-8");
}
