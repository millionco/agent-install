## General Rules

- MUST: Use @antfu/ni. Use `ni` to install, `nr SCRIPT_NAME` to run. `nun` to uninstall.
- MUST: Use TypeScript interfaces over types.
- MUST: Keep all types in the global scope.
- MUST: Use arrow functions over function declarations.
- MUST: Default to NO comments. Only add a comment when the "why" is truly non-obvious — browser quirks, platform bugs, performance tradeoffs, fragile internal patching, or counter-intuitive design decisions. Never add comments that restate what the code does or what a well-named function/variable already conveys.
- MUST: Use kebab-case for files.
- MUST: Use descriptive names for variables (avoid shorthands, or 1-2 character names).
- MUST: Do not type cast (`as`) unless absolutely necessary.
- MUST: Remove unused code and don't repeat yourself.
- MUST: Put all magic numbers in `constants.ts` using `SCREAMING_SNAKE_CASE` with unit suffixes (`_MS`, `_PX`).
- MUST: Put small, focused utility functions in `utils/` with one utility per file.
- MUST: Use `Boolean()` over `!!`.

## Development instructions

This is a pnpm monorepo with `apps/` and `packages/`. No external services required.

### Package layout

One package: `packages/agent-install` — `agent-install` on npm. It ships both the Node API (via subpath exports) and the CLI (via `bin`) from a single build.

```
src/
  index.ts            -> re-exports ./skill/index.ts (default = skill surface)
  skill.ts            -> ./skill/index.ts
  mcp.ts              -> ./mcp/index.ts
  agents-md.ts        -> ./agents-md/index.ts
  skill/              -> library: SKILL.md install, discovery, git/URL fetch
  mcp/                -> library: MCP server install across JSON/JSONC/YAML/TOML
  agents-md/          -> library: AGENTS.md section editor + CLAUDE.md symlink
  utils/              -> shared utilities
  cli/
    cli.ts            -> CLI entry (built to dist/cli.js; invoked via bin/agent-install.mjs shim)
    commands/
      skill/, mcp/, doc/
    utils/            -> CLI-only helpers (logger, formatters)
bin/
  agent-install.mjs   -> #!/usr/bin/env node shim that imports dist/cli.js
```

The CLI imports the library using relative paths (e.g. `../../../mcp/index.ts`). No `workspace:*` dependency loop.

### Key commands

- **Install**: `ni` (or `pnpm install`)
- **Build**: `nr build`
- **Dev watch**: `nr dev`
- **Test**: `pnpm test`
- **Lint**: `pnpm lint`
- **Typecheck**: `pnpm typecheck`
- **Format**: `pnpm format`

### Build before test

`pnpm build` must complete before `pnpm test` or `pnpm lint`. After modifying source files, always rebuild before running tests.

### Releasing

Releases are driven by [changesets](https://github.com/changesets/changesets). Every user-facing change must ship with a changeset:

```bash
pnpm changeset
```

Pick the affected package(s) and the bump kind (`patch` / `minor` / `major`). Commit the generated `.changeset/*.md` file with your PR. On merge to `main`, the **Release** GitHub Action opens (or updates) a `chore: release` PR. Merging that PR publishes to npm and tags the git release. Never edit `package.json` versions or `CHANGELOG.md` by hand.

### CI

Every PR and push to `main` runs `pnpm build && pnpm typecheck && pnpm lint && pnpm format:check && pnpm test` via `.github/workflows/ci.yml`. All gates must pass before merge.

## How the three surfaces work

**Skills**: a **source** is parsed (local path / GitHub / URL), remote sources are shallow-cloned into temp, `SKILL.md` files are discovered and copied into `.agents/skills/<name>`, and each selected agent gets either a relative symlink (with copy fallback) or a direct copy.

**MCP**: a **source** is parsed (remote URL / npm package / command), a `McpServerConfig` is built, and it is written into each selected agent's native config file. Each agent has:

- `format` — `json` | `jsonc` | `yaml` | `toml`
- `configKey` (dotted path, e.g. `mcpServers`, `mcp_servers`, `context_servers`, `mcp`, `extensions`, `servers`)
- `transformConfig` — optional per-agent translation (Goose, Zed, OpenCode, Codex, VS Code)

JSONC writes go through `jsonc-parser`'s `modify` so existing comments are preserved.

**AGENTS.md**: markdown-aware section editing. Sections are split by `^#{1,6} heading$` lines. `upsertAgentsMdSection` can `append`, `prepend`, or `replace`. Per-agent variants (`CLAUDE.md`, `GEMINI.md`, `.cursor/rules/*.mdc`) are resolved from a single `agentsMdFiles` table.
