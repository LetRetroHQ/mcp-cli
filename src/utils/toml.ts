function escapeTomlString(value: string): string {
  if (value.includes('"')) {
    return `'${value}'`;
  }
  return `"${value}"`;
}

function serializeValue(value: unknown): string {
  if (typeof value === "string") return escapeTomlString(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    const items = value.map((v) => serializeValue(v));
    return `[${items.join(", ")}]`;
  }
  return escapeTomlString(String(value));
}

export function tomlEntry(sections: string[], values: Record<string, unknown>): string {
  const lines: string[] = [];
  lines.push(`\n[${sections.join(".")}]`);
  for (const [key, value] of Object.entries(values)) {
    lines.push(`${key} = ${serializeValue(value)}`);
  }
  return lines.join("\n") + "\n";
}

export function addToTomlConfig(existing: string, serverName: string, serverConfig: Record<string, unknown>, env: Record<string, string>): string {
  const sectionHeader = `[mcp_servers.${serverName}]`;
  if (existing.includes(sectionHeader)) {
    return existing;
  }

  let result = existing;
  if (!result.endsWith("\n")) result += "\n";

  const cmd = serverConfig.command;
  const args = serverConfig.args;

  result += tomlEntry([`mcp_servers.${serverName}`], {
    command: cmd,
    args: args,
  });

  result += tomlEntry([`mcp_servers.${serverName}`, "env"], env);

  return result;
}

export function createTomlConfig(serverName: string, serverConfig: Record<string, unknown>, env: Record<string, string>): string {
  let result = "";
  const cmd = serverConfig.command;
  const args = serverConfig.args;

  result += tomlEntry([`mcp_servers.${serverName}`], {
    command: cmd,
    args: args,
  });

  result += tomlEntry([`mcp_servers.${serverName}`, "env"], env);

  return result;
}
