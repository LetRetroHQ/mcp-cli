import type { ClientModule } from "./index";
import { paths } from "../utils/paths";
import { detectBinary, detectConfigFile } from "./index";

export const opencode: ClientModule = {
  id: "opencode",
  name: "OpenCode",
  configPaths: () => paths.opencode(),
  format: "json",

  serverEntry(apiKey: string) {
    return {
      config: {
        type: "local",
        command: ["npx", "-y", "@letretro/mcp"],
        enabled: true,
      },
      env: { LETRETRO_API_KEY: apiKey },
    };
  },

  detect() {
    return detectBinary("opencode") || detectConfigFile(paths.opencode()) !== null;
  },
};
