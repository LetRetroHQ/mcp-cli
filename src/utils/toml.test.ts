import { describe, it, expect } from "vitest";
import { tomlEntry, createTomlConfig, addToTomlConfig } from "./toml";

describe("tomlEntry", () => {
  it("renders a TOML section with values", () => {
    const result = tomlEntry(["mcp_servers", "letretro"], {
      command: "npx",
      args: ["-y", "@letretro/mcp"],
    });
    expect(result).toContain("[mcp_servers.letretro]");
    expect(result).toContain('command = "npx"');
    expect(result).toContain('args = ["-y", "@letretro/mcp"]');
  });
});

describe("createTomlConfig", () => {
  it("creates a complete TOML config", () => {
    const result = createTomlConfig(
      "letretro",
      { command: "npx", args: ["-y", "@letretro/mcp"] },
      { LETRETRO_API_KEY: "lr_test" },
    );
    expect(result).toContain("[mcp_servers.letretro]");
    expect(result).toContain("[mcp_servers.letretro.env]");
    expect(result).toContain('LETRETRO_API_KEY = "lr_test"');
  });
});

describe("addToTomlConfig", () => {
  it("appends to existing config", () => {
    const existing = '[mcp_servers.github]\ncommand = "npx"\nargs = ["@github/mcp-server"]\n';
    const result = addToTomlConfig(
      existing,
      "letretro",
      { command: "npx", args: ["-y", "@letretro/mcp"] },
      { LETRETRO_API_KEY: "lr_test" },
    );
    expect(result).toContain("[mcp_servers.github]");
    expect(result).toContain("[mcp_servers.letretro]");
    expect(result).toContain("[mcp_servers.letretro.env]");
  });

  it("does not duplicate existing entry", () => {
    const existing = '[mcp_servers.letretro]\ncommand = "npx"\nargs = ["-y", "@letretro/mcp"]\n';
    const result = addToTomlConfig(
      existing,
      "letretro",
      { command: "npx", args: ["-y", "@letretro/mcp"] },
      { LETRETRO_API_KEY: "lr_test" },
    );
    expect(result).toBe(existing);
  });
});
