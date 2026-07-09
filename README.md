<div align="center">
  <img src="./public/logo.svg" alt="LetRetro" width="120" />
  <br/>
  <br/>
  <h1>@letretro/mcp</h1>
  <p><strong>LetRetro MCP — Connect your AI coding tools to LetRetro retrospectives.</strong></p>

  <p>
    <a href="https://www.npmjs.com/package/@letretro/mcp"><img src="https://img.shields.io/npm/v/@letretro/mcp?style=flat&logo=npm&color=%23000" alt="npm version" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-%23000?style=flat" alt="MIT License" /></a>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18-%23000?style=flat&logo=nodedotjs" alt="Node >=18" /></a>
  </p>
</div>

---

## What is this?

`@letretro/mcp` is the official [Model Context Protocol](https://modelcontextprotocol.io) package for LetRetro. It gives AI coding assistants direct access to your LetRetro workspace — boards, cards, retrospectives, and team data.

It runs in two modes:

| Mode | What it does |
|------|-------------|
| **`install`** | Interactive CLI wizard that auto-configures your MCP clients |
| **server** (default) | Local MCP stdio server using the official MCP SDK — forwards requests to `mcp.letretro.com` |

One install command, zero manual JSON editing.

---

## Quick start

```bash
npx @letretro/mcp install
```

You'll be prompted for your LetRetro API key. The installer detects your installed MCP clients and writes the configuration — you pick which ones to set up.

```
  ╔══════════════════════════════════╗
  ║     LetRetro MCP Installer       ║
  ╚══════════════════════════════════╝

  Enter your LetRetro API Key: ••••••

  Detected clients:
    ✓ Claude Desktop
    ✓ Cursor
    ✓ VS Code
    ✓ OpenAI Codex CLI
    ✓ OpenCode
    ✓ Antigravity
    ✓ Hermes
    ✓ OpenClaw

  (Use space to select, enter to confirm)
  ✔ Select clients to configure:

  ✓ Claude Desktop: Updated ~/Library/Application Support/Claude/claude_desktop_config.json
  ✓ Cursor: Created ~/.cursor/mcp.json

  ╔══════════════════════════════════╗
  ║     LetRetro MCP Installed        ║
  ╚══════════════════════════════════╝

  Restart your MCP clients to start using
  LetRetro tools.
```

### What gets configured

The installer adds a `letretro` server entry to your client's MCP config:

```json
{
  "mcpServers": {
    "letretro": {
      "command": "npx",
      "args": ["-y", "@letretro/mcp"],
      "env": {
        "LETRETRO_API_KEY": "lr_..."
      }
    }
  }
}
```

Restart your AI coding tool and LetRetro tools are automatically available.

---

## Supported clients

The installer auto-detects these clients and writes the correct config for each:

| Client | Auto-detect | Config file written | Format |
|--------|:-----------:|-------------------|--------|
| [Claude Desktop](https://claude.ai) | ✅ macOS/Linux | `claude_desktop_config.json` | JSON |
| [Cursor](https://cursor.sh) | ✅ | `~/.cursor/mcp.json` | JSON |
| [VS Code](https://code.visualstudio.com) | ✅ binary + config | `.vscode/mcp.json` | JSON |
| [OpenAI Codex CLI](https://developers.openai.com/codex) | ✅ | `~/.codex/config.toml` | TOML |
| [OpenCode](https://opencode.ai) | ✅ | `~/.config/opencode/opencode.json` | JSON |
| [Antigravity](https://antigravity.google) | ✅ | `~/.gemini/config/mcp_config.json` | JSON |
| [Hermes](https://hermes-agent.nousresearch.com) | ✅ | `~/.hermes/config.yaml` | YAML |
| [OpenClaw](https://openclaw.ai) | ✅ | `~/.openclaw/openclaw.json` | JSON |
| [Windsurf](https://codeium.com/windsurf) | ✅ config check | `~/.codeium/windsurf/mcp_config.json` | JSON |
| [Continue](https://continue.dev) | ✅ | `~/.continue/config.json` | JSON |

Don't see your client? [Open an issue](https://github.com/LetRetroHQ/mcp-cli/issues).

---

## How it works

```
AI Assistant                npx @letretro/mcp              mcp.letretro.com
     │                            │                              │
     │  MCP JSON-RPC over stdio   │                              │
     │  (initialize, tools/list,  │                              │
     │   tools/call, ...)         │                              │
     │──────────────────────────> │                              │
     │                            │  HTTP POST (Bearer token)    │
     │                            │  (forwarded JSON-RPC)        │
     │                            │ ────────────────────────────>│
     │                            │                              │
     │                            │  JSON-RPC response           │
     │                            │ <────────────────────────────│
     │  MCP JSON-RPC response     │                              │
     │ <──────────────────────────│                              │
```

The local process is a proper **MCP stdio server** built with the [official MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk). It:

- Handles the full MCP handshake (`initialize`, `ping`, `notifications/*`)
- Implements `tools/list` with a cached response from the remote server
- Forwards `tools/call` requests to `mcp.letretro.com` and returns results
- Supports graceful shutdown via `SIGTERM`/`SIGINT`
- Reads `LETRETRO_API_KEY` and an optional `LETRETRO_MCP_URL` override from the environment

All MCP tools, resources, and prompts are implemented server-side on `mcp.letretro.com`, so you get updates instantly — no package upgrade needed.

---

## Manual setup

If you prefer to configure clients manually instead of using the installer, add the following to your client's MCP config file.

**Claude Desktop / Cursor / Antigravity / OpenClaw / Windsurf / Continue:**
```json
{
  "mcpServers": {
    "letretro": {
      "command": "npx",
      "args": ["-y", "@letretro/mcp"],
      "env": {
        "LETRETRO_API_KEY": "your_key_here"
      }
    }
  }
}
```

**VS Code:**
```json
{
  "servers": {
    "letretro": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@letretro/mcp"],
      "env": {
        "LETRETRO_API_KEY": "your_key_here"
      }
    }
  }
}
```

**OpenCode:**
```json
{
  "mcp": {
    "letretro": {
      "type": "local",
      "command": ["npx", "-y", "@letretro/mcp"],
      "enabled": true,
      "environment": {
        "LETRETRO_API_KEY": "your_key_here"
      }
    }
  }
}
```

**OpenAI Codex CLI:**
```toml
[mcp_servers.letretro]
command = "npx"
args = ["-y", "@letretro/mcp"]

[mcp_servers.letretro.env]
LETRETRO_API_KEY = "your_key_here"
```

**Hermes:**
```yaml
mcp_servers:
  letretro:
    command: "npx"
    args:
      - "-y"
      - "@letretro/mcp"
    env:
      LETRETRO_API_KEY: "your_key_here"
```

---

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LETRETRO_API_KEY` | — | Your LetRetro API key (required) |
| `LETRETRO_MCP_URL` | `https://mcp.letretro.com` | Override the remote MCP server URL (for testing) |
| `LETRETRO_VALIDATE_URL` | `https://mcp.letretro.com` | URL used for API key validation during install |

---

## Development

```bash
git clone https://github.com/LetRetroHQ/mcp-cli.git
cd letretro-mcp/mcp-npm
pnpm install
pnpm dev          # watch mode
pnpm build        # production build
pnpm typecheck    # type checking
pnpm test         # run tests
```

### Project structure

```
src/
├── index.ts           # Entry point — routes to install or server mode
├── install.ts         # Interactive installer (prompt → detect → configure)
├── server.ts          # MCP stdio server (MCP SDK) — forwards to mcp.letretro.com
├── clients/
│   ├── index.ts       # Client registry and detection helpers
│   ├── claude.ts      # Claude Desktop
│   ├── cursor.ts      # Cursor
│   ├── vscode.ts      # VS Code
│   ├── codex.ts       # OpenAI Codex CLI (TOML config)
│   ├── opencode.ts    # OpenCode
│   ├── antigravity.ts # Google Antigravity
│   ├── hermes.ts      # Hermes Agent (YAML config)
│   ├── openclaw.ts    # OpenClaw
│   ├── windsurf.ts    # Windsurf
│   └── continue.ts    # Continue
└── utils/
    ├── paths.ts       # OS-aware config file paths
    ├── toml.ts        # TOML serializer for Codex config
    └── yaml.ts        # YAML serializer for Hermes config
```

---

## Contributing

Contributions are welcome! Whether it's adding support for a new MCP client, improving the installer, or fixing a bug:

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -am 'feat: add support for...'`)
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## License

[MIT](LICENSE) © [LetRetro](https://letretro.com)

---

<div align="center">
  <sub>Built by the LetRetro team</sub>
</div>
