import type { ClientModule } from "./index";
import { paths } from "../utils/paths";
import { detectBinary } from "./index";

export const vscode: ClientModule = {
  id: "vscode",
  name: "VS Code",
  configPaths: () => paths.vscode(),
  format: "json",

  serverEntry(apiKey: string) {
    return {
      config: {
        type: "stdio",
        command: "npx",
        args: ["-y", "@letretro/mcp"],
      },
      env: { LETRETRO_API_KEY: apiKey },
    };
  },

  detect() {
    return detectBinary("code") || detectBinary("code-insiders");
  },
};
