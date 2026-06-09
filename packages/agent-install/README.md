# agent-install

Install `SKILL.md` files, MCP servers, and `AGENTS.md` guidance for any AI coding agent. Ships a **Node API** _and_ a **CLI** from a single package.

```bash
pnpm add agent-install
# or, as a one-shot CLI
npx agent-install@latest <skill|mcp|agents-md> <action>
```

## Node API

```ts
import { installSkillsFromSource } from "agent-install";
import { installMcpServer } from "agent-install/mcp";
import {
  readAgentsMd,
  upsertAgentsMdSection,
  symlinkClaudeToAgents,
} from "agent-install/agents-md";
```

### Skills

```ts
await installSkillsFromSource({
  source: "./skills/react-grab", // local, owner/repo, URL, or direct SKILL.md
  agents: ["claude-code", "cursor"],
  cwd: process.cwd(),
  mode: "symlink", // or "copy"
});
```

One canonical copy lives at `.agents/skills/<name>`; agent-specific dirs (`.claude/skills`, `.cursor/skills`, etc.) receive relative symlinks, with automatic copy fallback on systems that don't allow them.

### MCP servers

```ts
installMcpServer({
  source: "https://mcp.context7.com/mcp",
  agents: ["cursor", "claude-code"],
  name: "context7",
});

installMcpServer({
  source: "@modelcontextprotocol/server-postgres",
  agents: ["claude-code"],
  env: { DATABASE_URL: "postgres://..." },
});

// Also available:
// listInstalledMcpServers, removeMcpServer, parseMcpSource,
// buildMcpServerConfig, mcpAgents, detectProjectInstalledMcpAgents, ...
```

14 MCP hosts across 3 config formats (JSON/JSONC with comment preservation, YAML, TOML). Per-agent `transformConfig` hooks handle Goose's `{cmd, envs, enabled, timeout}`, Zed's `{source: "custom", ...}`, OpenCode's `{type, command[], environment}`, Codex TOML layout, and VS Code's `{type: "stdio", ...}`.

Source types auto-detected by `parseMcpSource`:

| Input                                   | Type      | Becomes                                 |
| --------------------------------------- | --------- | --------------------------------------- |
| `https://mcp.example.com/mcp`           | `remote`  | `{ type: "http", url }`                 |
| `@modelcontextprotocol/server-postgres` | `package` | `{ command: "npx", args: ["-y", pkg] }` |
| `"node /path/server.js --port 3000"`    | `command` | `{ command: "node", args: [...] }`      |

### AGENTS.md / CLAUDE.md / GEMINI.md

```ts
const { sections, content, path } = readAgentsMd();

upsertAgentsMdSection({
  heading: "Testing",
  body: "Run `pnpm test` before every commit.",
  placement: "replace", // or "append" / "prepend"
  level: 2,
});

// Agent-specific variants
upsertAgentsMdSection({
  agent: "gemini-cli", // writes GEMINI.md
  heading: "Setup",
  body: "...",
});

// Claude Code still reads CLAUDE.md; point it at the canonical AGENTS.md
await symlinkClaudeToAgents({ overwrite: false });
```

Known variants (from `agentsMdFiles`):

| Agent       | File                  |
| ----------- | --------------------- |
| universal   | `AGENTS.md`           |
| claude-code | `CLAUDE.md`           |
| gemini-cli  | `GEMINI.md`           |
| cursor      | `.cursor/rules/*.mdc` |
| codex       | `AGENTS.md`           |
| opencode    | `AGENTS.md`           |
| aider       | `AGENTS.md`           |

## CLI

```
agent-install skill <action>     Manage SKILL.md files
  add <source>                   -a, --agent, -s, --skill, -g, --global, --copy, -y, -l
  init [name]
  list                           -g, -a, --json
  remove [skills...]             -g, -a, -y

agent-install mcp <action>
  add <source>                   -a, -g, -t|--transport, --header, --env, -n|--name, -y, --all
  list                           -g, -a, --json
  remove <name>                  -g, -a, -y

agent-install agents-md <action>      (alias: doc)
  init                           [--agent <agent>]
  read                           [--agent <agent>] [-f <file>] [--json]
  set-section <heading>          --body | --body-file, --placement, --level, --agent, -f
  remove-section <heading>       --agent, -f
  symlink-claude                 --overwrite, --backup <name>
```

## Subpath exports

| Import                    | Surface                                             |
| ------------------------- | --------------------------------------------------- |
| `agent-install`           | Skills (root default)                               |
| `agent-install/skill`     | Alias of the root import                            |
| `agent-install/mcp`       | MCP servers                                         |
| `agent-install/agents-md` | AGENTS.md manipulation + `CLAUDE.md` symlink helper |

## References

- MCP build guide: [modelcontextprotocol.io/docs/develop/build-server](https://modelcontextprotocol.io/docs/develop/build-server)
- AGENTS.md spec: [agents.md](https://agents.md/)
