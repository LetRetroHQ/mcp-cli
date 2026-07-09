import type { ClientModule } from "./index";
import { paths } from "../utils/paths";
import { detectBinary, detectConfigFile } from "./index";

export const antigravity: ClientModule = {
  id: "antigravity",
  name: "Antigravity",
  configPaths: () => paths.antigravity(),
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
    return detectBinary("antigravity") || detectBinary("agy") || detectConfigFile(paths.antigravity()) !== null;
  },
};
