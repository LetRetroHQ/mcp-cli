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

## ✨ What is this?

`@letretro/mcp` is the official [Model Context Protocol](https://modelcontextprotocol.io) package for LetRetro. It gives AI coding assistants direct access to your LetRetro workspace — boards, cards, retrospectives, and team data.

It runs in two modes:

| Mode | What it does |
|------|-------------|
| **`install`** | Interactive CLI wizard that auto-configures your MCP clients |
| **server** (default) | Lightweight stdio-to-HTTP proxy that connects AI tools to `mcp.letretro.com` |

One install command, zero manual JSON editing.

---

## 🚀 Quick start

```bash
npx @letretro/mcp install
```

You'll be prompted for your LetRetro API key. The installer detects your installed MCP clients and writes the configuration — you pick which ones to set up.

```
┌──────────────────────────────────────┐
│        LetRetro MCP Installer         │
└──────────────────────────────────────┘

✔ Enter your LetRetro API Key: lr_••••••••••••••••

  Detected clients:
    ✓ Claude Desktop
    ✓ Cursor
    ✓ VS Code
    ✓ OpenAI Codex CLI
    ✓ OpenCode
    ✓ Antigravity

✔ Select clients to configure: [Claude Desktop, Cursor]

  ✓ Claude Desktop: Updated ~/Library/Application Support/Claude/claude_desktop_config.json
  ✓ Cursor: Created ~/.cursor/mcp.json

┌──────────────────────────────────────────────┐
│  ✅  LetRetro MCP installed successfully!    │
│                                              │
│  Restart your MCP clients to start using     │
│  LetRetro tools.                             │
└──────────────────────────────────────────────┘
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

## 🖥️ Supported clients

| Client | Auto-detect | Config file written |
|--------|:-----------:|-------------------|
| [Claude Desktop](https://claude.ai) | ✅ | `claude_desktop_config.json` |
| [Cursor](https://cursor.sh) | ✅ | `~/.cursor/mcp.json` |
| [VS Code](https://code.visualstudio.com) | ✅ | `.vscode/mcp.json` |
| [OpenAI Codex CLI](https://developers.openai.com/codex) | ✅ | `~/.codex/config.toml` |
| [OpenCode](https://opencode.ai) | ✅ | `~/.config/opencode/opencode.json` |
| [Antigravity](https://antigravity.google) | ✅ | `~/.gemini/config/mcp_config.json` |

Don't see your client? [Open an issue](https://github.com/LetRetroHQ/mcp-cli/issues).

---

## 🧰 How it works

```
AI Assistant                npx @letretro/mcp              mcp.letretro.com
     │                            │                              │
     │  JSON-RPC over stdio       │                              │
     │──────────────────────────> │                              │
     │                            │  HTTP POST (Bearer token)    │
     │                            │ ────────────────────────────>│
     │                            │                              │
     │                            │  JSON-RPC response           │
     │                            │ <────────────────────────────│
     │  JSON-RPC response         │                              │
     │ <──────────────────────────│                              │
```

The local process is a lightweight proxy — it reads `LETRETRO_API_KEY` from the environment, forwards JSON-RPC messages to the hosted LetRetro MCP server at `mcp.letretro.com`, and streams responses back. All MCP tools, resources, and prompts are implemented server-side, so you get updates instantly — no package upgrade needed.

---

## 📦 Manual setup

If you prefer to configure clients manually instead of using the installer, add the following to your client's MCP config file:

**Claude Desktop / Cursor / Antigravity:**
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

---

## 🔧 Development

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
├── server.ts          # stdio ↔ HTTP proxy to mcp.letretro.com
├── clients/
│   ├── index.ts       # Client registry and detection helpers
│   ├── claude.ts      # Claude Desktop
│   ├── cursor.ts      # Cursor
│   ├── vscode.ts      # VS Code
│   ├── codex.ts       # OpenAI Codex CLI (TOML config)
│   ├── opencode.ts    # OpenCode
│   └── antigravity.ts # Google Antigravity
└── utils/
    ├── paths.ts       # OS-aware config file paths
    └── toml.ts        # TOML serializer for Codex config
```

---

## 🤝 Contributing

Contributions are welcome! Whether it's adding support for a new MCP client, improving the installer, or fixing a bug:

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -am 'feat: add support for...'`)
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

[MIT](LICENSE) © [LetRetro](https://letretro.com)

---

<div align="center">
  <sub>Built with ❤️ by the LetRetro team</sub>
</div>
