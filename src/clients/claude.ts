import { existsSync } from "node:fs";
import type { ClientModule } from "./index";
import { paths } from "../utils/paths";
import { isMacOS } from "../utils/paths";

const claudeDesktopExists = (): boolean => {
  if (isMacOS()) {
    const appPath = "/Applications/Claude Desktop.app";
    return existsSync(appPath);
  }
  return false;
};

export const claude: ClientModule = {
  id: "claude",
  name: "Claude Desktop",
  configPaths: () => paths.claude(),
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
    return claudeDesktopExists();
  },
};
