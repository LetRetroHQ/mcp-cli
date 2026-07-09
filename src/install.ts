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
import { hermes, writeHermesConfig } from "./clients/hermes";
import { openclaw } from "./clients/openclaw";
import { windsurf } from "./clients/windsurf";
import { continueClient } from "./clients/continue";

const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const BG_BLUE = "\x1b[44m";
const WHITE = "\x1b[37m";

const HEADER = `
  ${BG_BLUE}${WHITE}${BOLD}╔══════════════════════════════════╗${RESET}
  ${BG_BLUE}${WHITE}${BOLD}║     LetRetro MCP Installer       ║${RESET}
  ${BG_BLUE}${WHITE}${BOLD}╚══════════════════════════════════╝${RESET}
`;

const SUCCESS_HEADER = `
  ${BG_BLUE}${WHITE}${BOLD}╔══════════════════════════════════╗${RESET}
  ${BG_BLUE}${WHITE}${BOLD}║     LetRetro MCP Installed        ║${RESET}
  ${BG_BLUE}${WHITE}${BOLD}╚══════════════════════════════════╝${RESET}
`;

const MCP_VALIDATE_URL = process.env.LETRETRO_VALIDATE_URL || "https://mcp.letretro.com";

const ALL_CLIENTS: ClientModule[] = [
  claude,
  cursor,
  vscode,
  codex,
  opencode,
  antigravity,
  hermes,
  openclaw,
  windsurf,
  continueClient,
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
  if (servers["letretro"]) {
    console.warn(`  ⚠ Overwriting existing "letretro" entry in config`);
  }
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

const JSON_CLIENTS: Set<string> = new Set(["claude", "cursor", "vscode", "opencode", "antigravity", "openclaw", "windsurf", "continue"]);

const CLIENT_CONFIG_MAP: Record<string, { topKey: string }> = {
  claude: { topKey: "mcpServers" },
  cursor: { topKey: "mcpServers" },
  vscode: { topKey: "servers" },
  opencode: { topKey: "mcp" },
  antigravity: { topKey: "mcpServers" },
  openclaw: { topKey: "mcpServers" },
  windsurf: { topKey: "mcpServers" },
  continue: { topKey: "mcpServers" },
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
  const configPath = client.configPaths()[0]!;
  const wasCreated = !existsSync(configPath);

  if (client.id === "codex") {
    writeCodexConfig(configPath, apiKey);
    return { configPath, wasCreated };
  }

  if (client.id === "hermes") {
    writeHermesConfig(configPath, apiKey);
    return { configPath, wasCreated };
  }

  return writeJsonClient(client, apiKey);
}

async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(MCP_VALIDATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function runInstaller(): Promise<void> {
  console.log(HEADER);

  const { apiKey } = await enquirer.prompt<{ apiKey: string }>({
    type: "password",
    name: "apiKey",
    message: "Enter your LetRetro API Key:",
    validate(input: string) {
      if (!input.startsWith("lr_")) return "API key must start with lr_";
      if (!/^lr_[a-zA-Z0-9]+$/.test(input)) return "API key contains invalid characters";
      if (input.length < 10) return "API key seems too short";
      return true;
    },
  });

  console.log("");
  console.log("  Validating API key...");
  const isValid = await validateApiKey(apiKey);
  if (isValid) {
    console.log("  ✓ API key validated successfully");
  } else {
    console.warn("  ⚠ Could not validate API key (network or server issue). Proceeding anyway.");
    console.warn("    If configuration fails, double-check your key at https://letretro.com");
  }
  console.log("");

  const detected = ALL_CLIENTS.filter((c) => c.detect()).map((c) => c.name);
  const notDetected = ALL_CLIENTS.filter((c) => !c.detect()).map((c) => c.name);

  if (detected.length === 0) {
    console.log("  No supported MCP clients detected.");
    console.log("  Install one of: " + notDetected.join(", "));
    console.log("  Then run this installer again.");
    console.log("");
    return;
  }

  console.log("  Detected clients:");
  for (const name of detected) {
    console.log(`    ✓ ${name}`);
  }
  if (notDetected.length > 0) {
    console.log(`\n  Not detected (skipped):`);
    for (const name of notDetected) {
      console.log(`    ✗ ${name}`);
    }
  }

  console.log(`  ${DIM}(Use ${BOLD}space${RESET}${DIM} to select, ${BOLD}enter${RESET}${DIM} to confirm)${RESET}`);
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
  console.log(SUCCESS_HEADER);
  console.log("");
  console.log("  Restart your MCP clients to start using");
  console.log("  LetRetro tools.");
  console.log("");
}
