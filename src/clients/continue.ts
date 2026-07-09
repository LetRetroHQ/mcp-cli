import type { ClientModule } from "./index";
import { paths } from "../utils/paths";
import { detectBinary, detectConfigFile } from "./index";

export const continueClient: ClientModule = {
  id: "continue",
  name: "Continue",
  configPaths: () => paths.continueConfig(),
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
    return detectBinary("continue") || detectConfigFile(paths.continueConfig()) !== null;
  },
};
