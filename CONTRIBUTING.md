# Contributing to @letretro/mcp

We love contributions! Here's how to get started.

## 🚀 Quick start

```bash
git clone https://github.com/LetRetroHQ/mcp-cli.git
cd letretro-mcp/mcp-npm
pnpm install
pnpm dev
```

## 🧪 Testing

```bash
pnpm test         # run tests
pnpm typecheck    # ensure types pass
pnpm build        # verify build
```

## 📐 Code style

- TypeScript strict mode — no `any` unless absolutely necessary
- Follow existing patterns in the codebase
- Keep dependencies minimal — the package should stay lightweight
- Use Node.js built-in APIs where possible over third-party libraries

## 🧩 Adding a new client

1. Create a new file in `src/clients/<name>.ts`
2. Export a `ClientModule` object following the interface in `src/clients/index.ts`
3. Add your client to the `ALL_CLIENTS` array in `src/install.ts`
4. Add config paths in `src/utils/paths.ts`
5. Add client info to the table in `README.md`
6. Write tests in `test/clients/`

The `ClientModule` interface:

```typescript
interface ClientModule {
  id: string;              // unique identifier (kebab-case)
  name: string;            // display name
  configPaths(): string[]; // possible config file paths
  format: "json" | "toml"; // config file format
  serverEntry(apiKey: string): {
    config: Record<string, unknown>;  // server config (command, args, type, etc.)
    env: Record<string, string>;      // environment variables
  };
  detect(): boolean;       // check if this client is installed
}
```

## 📦 Publishing

```bash
npm version patch|minor|major
git push --follow-tags
```

The GitHub Actions workflow publishes to npm automatically on `v*` tags.

## 🐛 Reporting issues

Open a [GitHub Issue](https://github.com/LetRetroHQ/mcp-cli/issues) with:
- Description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, client, Node version)
