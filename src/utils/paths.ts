import { homedir, platform } from "node:os";
import { join } from "node:path";

export function home(): string {
  return homedir();
}

export function isWindows(): boolean {
  return platform() === "win32";
}

export function isMacOS(): boolean {
  return platform() === "darwin";
}

export function isLinux(): boolean {
  return platform() === "linux";
}

function appData(): string {
  return process.env.APPDATA || join(home(), "AppData", "Roaming");
}

export const paths = {
  claude(): string[] {
    if (isMacOS()) {
      return [
        join(home(), "Library", "Application Support", "Claude", "claude_desktop_config.json"),
      ];
    }
    if (isWindows()) {
      return [join(appData(), "Claude", "claude_desktop_config.json")];
    }
    return [join(home(), ".config", "Claude", "claude_desktop_config.json")];
  },

  cursor(): string[] {
    return [join(home(), ".cursor", "mcp.json")];
  },

  vscode(): string[] {
    return [join(home(), ".vscode", "mcp.json")];
  },

  codex(): string[] {
    return [join(home(), ".codex", "config.toml")];
  },

  opencode(): string[] {
    const xdg = process.env.XDG_CONFIG_HOME || join(home(), ".config");
    return [join(xdg, "opencode", "opencode.json")];
  },

  antigravity(): string[] {
    return [
      join(home(), ".gemini", "config", "mcp_config.json"),
    ];
  },
};
