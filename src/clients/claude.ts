import { existsSync } from "node:fs";
import { join } from "node:path";
import type { ClientModule } from "./index";
import { paths, isMacOS, isLinux } from "../utils/paths";

const claudeDesktopExists = (): boolean => {
  if (isMacOS()) {
    return existsSync("/Applications/Claude Desktop.app");
  }
  if (isLinux()) {
    const home = process.env.HOME || "";
    return (
      existsSync(join(home, ".local", "bin", "claude")) ||
      existsSync("/opt/Claude/claude-desktop")
    );
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
