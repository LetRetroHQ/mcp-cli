import type { ClientModule } from "./index";
import { paths } from "../utils/paths";
import { detectConfigFile } from "./index";

export const windsurf: ClientModule = {
  id: "windsurf",
  name: "Windsurf",
  configPaths: () => paths.windsurf(),
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
    return detectConfigFile(paths.windsurf()) !== null;
  },
};
