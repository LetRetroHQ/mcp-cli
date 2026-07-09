import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

export interface ClientModule {
  id: string;
  name: string;
  configPaths(): string[];
  format: "json" | "toml" | "yaml";
  serverEntry(apiKey: string): { config: Record<string, unknown>; env: Record<string, string> };
  detect(): boolean;
}

export function detectBinary(name: string): boolean {
  try {
    execSync(`which ${name} 2>/dev/null || where ${name} >/dev/null 2>&1`, {
      stdio: "ignore",
      timeout: 2000,
    });
    return true;
  } catch {
    return false;
  }
}

export function detectConfigFile(paths: string[]): string | null {
  for (const p of paths) {
    if (existsSync(p)) return p;
  }
  return null;
}
