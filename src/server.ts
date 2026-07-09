import { Server } from "@modelcontextprotocol/sdk/server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const REMOTE_URL = process.env.LETRETRO_MCP_URL || "https://mcp.letretro.com";

// tools/list response is cached forever — the remote returns static definitions
// (see letretro-mcp/src/mcp-router.ts toolDefinitions const, 17 tools, never changes)
let toolsListCache: { tools: Array<unknown>; _meta: object } | null = null;

async function forwardToRemote(
  method: string,
  params?: Record<string, unknown>,
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const apiKey = process.env.LETRETRO_API_KEY;
  if (!apiKey) {
    return { content: [{ type: "text", text: "LETRETRO_API_KEY environment variable is required" }], isError: true };
  }

  try {
    const response = await fetch(REMOTE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: crypto.randomUUID(),
        method,
        params,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { content: [{ type: "text", text: `Remote server error (${response.status}): ${errorText}` }], isError: true };
    }

    const data = await response.json();
    if (data.error) {
      return { content: [{ type: "text", text: data.error.message || String(data.error) }], isError: true };
    }

    return { content: [{ type: "text", text: JSON.stringify(data.result) }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Failed to connect to remote server: ${err}` }], isError: true };
  }
}

export async function startServer(): Promise<void> {
  const apiKey = process.env.LETRETRO_API_KEY;
  if (!apiKey) {
    console.error("LETRETRO_API_KEY environment variable is required");
    process.exit(1);
  }

  const server = new Server(
    { name: "@letretro/mcp", version: "0.1.2" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    if (toolsListCache) return toolsListCache as any;

    const result = await forwardToRemote("tools/list");
    if (result.isError || !result.content[0]) {
      return { tools: [], _meta: {} };
    }
    try {
      toolsListCache = JSON.parse(result.content[0].text);
      return toolsListCache as any;
    } catch {
      return { tools: [], _meta: {} };
    }
  });

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    return await forwardToRemote("tools/call", req.params as Record<string, unknown>);
  });

  process.on("SIGTERM", () => { server.close(); process.exit(0); });
  process.on("SIGINT", () => { server.close(); process.exit(0); });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
