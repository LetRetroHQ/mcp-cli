import type { ClientModule } from "./index";
import { paths } from "../utils/paths";
import { detectBinary, detectConfigFile } from "./index";

export const openclaw: ClientModule = {
  id: "openclaw",
  name: "OpenClaw",
  configPaths: () => paths.openclaw(),
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
    return detectBinary("openclaw") || detectConfigFile(paths.openclaw()) !== null;
  },
};
