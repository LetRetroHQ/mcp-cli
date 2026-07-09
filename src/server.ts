import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const MCP_SERVER_URL = "https://mcp.letretro.com";

export async function startServer(): Promise<void> {
  const apiKey = process.env.LETRETRO_API_KEY;
  if (!apiKey) {
    console.error("LETRETRO_API_KEY environment variable is required");
    process.exit(1);
  }

  const rl = readline.createInterface({ input: stdin });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      const response = await fetch(MCP_SERVER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: trimmed,
      });

      if (response.ok) {
        const text = await response.text();
        if (text) {
          stdout.write(text + "\n");
        }
      } else {
        const errorText = await response.text();
        console.error(`MCP server error (${response.status}): ${errorText}`);
      }
    } catch (err) {
      console.error(`Failed to connect to MCP server: ${err}`);
    }
  }
}
