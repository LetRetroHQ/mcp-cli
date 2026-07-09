export function addToYamlConfig(existing: string, serverName: string, command: string, args: string[], env: Record<string, string>): string {
  if (existing.includes(`  ${serverName}:`)) {
    return existing;
  }

  let result = existing;
  if (!result.endsWith("\n")) result += "\n";

  if (!result.includes("mcp_servers:")) {
    result += "mcp_servers:\n";
  }

  result += `  ${serverName}:\n`;
  result += `    command: "${command}"\n`;
  result += `    args:\n`;
  for (const arg of args) {
    result += `      - "${arg}"\n`;
  }
  result += `    env:\n`;
  for (const [key, value] of Object.entries(env)) {
    result += `      ${key}: "${value}"\n`;
  }
  return result;
}

export function createYamlConfig(serverName: string, command: string, args: string[], env: Record<string, string>): string {
  let result = "mcp_servers:\n";
  result += `  ${serverName}:\n`;
  result += `    command: "${command}"\n`;
  result += `    args:\n`;
  for (const arg of args) {
    result += `      - "${arg}"\n`;
  }
  result += `    env:\n`;
  for (const [key, value] of Object.entries(env)) {
    result += `      ${key}: "${value}"\n`;
  }
  return result;
}
