import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import enquirer from "enquirer";
import type { ClientModule } from "./clients/index";
import { claude } from "./clients/claude";
import { cursor } from "./clients/cursor";
import { vscode } from "./clients/vscode";
import { codex, writeCodexConfig } from "./clients/codex";
import { opencode } from "./clients/opencode";
import { antigravity } from "./clients/antigravity";

const ALL_CLIENTS: ClientModule[] = [
  claude,
  cursor,
  vscode,
  codex,
  opencode,
  antigravity,
];

interface McpServersConfig {
  mcpServers?: Record<string, unknown>;
  servers?: Record<string, unknown>;
  mcp?: Record<string, unknown>;
}

function mergeLetretroIntoJson(
  existing: McpServersConfig,
  topKey: string,
  config: Record<string, unknown>,
  env: Record<string, string>,
): McpServersConfig {
  const serverEntry = {
    ...config,
    env,
  };

  const top = existing as Record<string, unknown>;
  const servers = ((top[topKey] ?? {}) as Record<string, unknown>);
  servers["letretro"] = serverEntry;
  top[topKey] = servers;
  return top as unknown as McpServersConfig;
}

function writeJsonConfig(configPath: string, data: McpServersConfig): void {
  const dir = dirname(configPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(configPath, JSON.stringify(data, null, 2), "utf-8");
}

function readJsonConfig(configPath: string): McpServersConfig {
  if (!existsSync(configPath)) return {};
  try {
    return JSON.parse(readFileSync(configPath, "utf-8")) as McpServersConfig;
  } catch {
    console.warn(`  ⚠ Could not parse ${configPath}, creating fresh`);
    return {};
  }
}

type ClientWriter = (client: ClientModule, apiKey: string) => { configPath: string; wasCreated: boolean };

const JSON_CLIENTS: Set<string> = new Set(["claude", "cursor", "vscode", "opencode", "antigravity"]);

const CLIENT_CONFIG_MAP: Record<string, { topKey: string }> = {
  claude: { topKey: "mcpServers" },
  cursor: { topKey: "mcpServers" },
  vscode: { topKey: "servers" },
  opencode: { topKey: "mcp" },
  antigravity: { topKey: "mcpServers" },
};

function writeJsonClient(client: ClientModule, apiKey: string): { configPath: string; wasCreated: boolean } {
  const paths = client.configPaths();
  const configPath = paths[0]!;
  const { config, env } = client.serverEntry(apiKey);
  const cfg = CLIENT_CONFIG_MAP[client.id];
  const topKey = cfg?.topKey ?? "mcpServers";

  const existing = readJsonConfig(configPath);
  const updated = mergeLetretroIntoJson(existing, topKey, config, env);
  const wasCreated = !existsSync(configPath);
  writeJsonConfig(configPath, updated);
  return { configPath, wasCreated };
}

function writeClient(client: ClientModule, apiKey: string): { configPath: string; wasCreated: boolean } {
  if (client.id === "codex") {
    const configPath = client.configPaths()[0]!;
    const wasCreated = !existsSync(configPath);
    writeCodexConfig(configPath, apiKey);
    return { configPath, wasCreated };
  }

  return writeJsonClient(client, apiKey);
}

export async function runInstaller(): Promise<void> {
  console.log("");
  console.log("  ┌──────────────────────────────────────┐");
  console.log("  │        LetRetro MCP Installer         │");
  console.log("  └──────────────────────────────────────┘");
  console.log("");

  const { apiKey } = await enquirer.prompt<{ apiKey: string }>({
    type: "password",
    name: "apiKey",
    message: "Enter your LetRetro API Key:",
    validate(input: string) {
      if (!input.startsWith("lr_")) return "API key must start with lr_";
      if (input.length < 10) return "API key seems too short";
      return true;
    },
  });

  const detected = ALL_CLIENTS.filter((c) => c.detect()).map((c) => c.name);
  const notDetected = ALL_CLIENTS.filter((c) => !c.detect()).map((c) => c.name);

  if (detected.length === 0) {
    console.log("  No supported MCP clients detected.");
    console.log("  Install one of: " + notDetected.join(", "));
    console.log("  Then run this installer again.");
    console.log("");
    return;
  }

  console.log("\n  Detected clients:");
  for (const name of detected) {
    console.log(`    ✓ ${name}`);
  }
  if (notDetected.length > 0) {
    console.log(`\n  Not detected (skipped):`);
    for (const name of notDetected) {
      console.log(`    ✗ ${name}`);
    }
  }

  const { selected } = await enquirer.prompt<{ selected: string[] }>({
    type: "multiselect",
    name: "selected",
    message: "Select clients to configure:",
    choices: detected.map((name) => ({ name, value: name })),
  });

  if (selected.length === 0) {
    console.log("\n  No clients selected. Exiting.");
    return;
  }

  console.log("");
  for (const client of ALL_CLIENTS) {
    if (!selected.includes(client.name)) continue;
    try {
      const { configPath, wasCreated } = writeClient(client, apiKey);
      const action = wasCreated ? "Created" : "Updated";
      console.log(`  ✓ ${client.name}: ${action} ${configPath}`);
    } catch (err) {
      console.error(`  ✗ ${client.name}: Failed — ${err}`);
    }
  }

  console.log("");
  console.log("  ┌──────────────────────────────────────────────┐");
  console.log("  │  ✅  LetRetro MCP installed successfully!    │");
  console.log("  │                                              │");
  console.log("  │  Restart your MCP clients to start using     │");
  console.log("  │  LetRetro tools.                             │");
  console.log("  └──────────────────────────────────────────────┘");
  console.log("");
}
