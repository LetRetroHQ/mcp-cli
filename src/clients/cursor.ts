import { existsSync } from "node:fs";
import type { ClientModule } from "./index";
import { paths } from "../utils/paths";

export const cursor: ClientModule = {
  id: "cursor",
  name: "Cursor",
  configPaths: () => paths.cursor(),
  format: "json",

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
    const configPath = paths.cursor()[0];
    if (configPath && existsSync(configPath)) return true;
    return false;
  },
};
