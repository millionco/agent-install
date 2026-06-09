# <img src="https://github.com/millionco/agent-install/blob/main/.github/assets/logo.svg?raw=true" width="40" align="center" /> agent-install

[![version](https://img.shields.io/npm/v/agent-install?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/agent-install)
[![downloads](https://img.shields.io/npm/dt/agent-install.svg?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/agent-install)

Install agent skills and MCPs with one API.

Works with Claude Code, Cursor, Codex, OpenCode, and 40+ other coding agents. Writes to each one's native config (skills directory, MCP JSON/JSONC/YAML/TOML, AGENTS.md) so your CLI or build script doesn't have to learn ten different formats. A small `agent-install` CLI is also included for one-off use.

## Install

As a library:

```bash
npm install agent-install
```

Or use the CLI directly without installing:

```bash
npx agent-install@latest --help
```

## Quick start

```bash
npx agent-install@latest skill add owner/repo -a cursor
npx agent-install@latest mcp add https://mcp.context7.com/mcp -a cursor
npx agent-install@latest agents-md set-section "Testing" --body "Run pnpm test"
```

Same three actions from the Node API:

```ts
import { skill, mcp, agentsMd } from "agent-install";

await skill.add({ source: "owner/repo", agents: ["cursor"] });
mcp.add({ source: "https://mcp.context7.com/mcp", agents: ["cursor"], name: "context7" });
agentsMd.setSection({ heading: "Testing", body: "Run pnpm test" });
```

The Node API is namespaced by surface (`skill`, `mcp`, `agentsMd`) using verbs that match the CLI (`add`, `list`, `remove`, `setSection`, `removeSection`, `read`).

## CLI

A thin wrapper around the Node API for one-off installs, scripts, and CI.

### Skills

```bash
npx agent-install@latest skill add ./skills/react-grab
npx agent-install@latest skill add owner/repo
npx agent-install@latest skill add https://github.com/owner/repo/tree/main/skills/foo

npx agent-install@latest skill init [name]      # create a new SKILL.md
npx agent-install@latest skill list             # list installed skills
npx agent-install@latest skill remove [skills]  # remove installed skills
```

### MCP servers

```bash
npx agent-install@latest mcp add https://mcp.context7.com/mcp -a cursor
npx agent-install@latest mcp add @modelcontextprotocol/server-postgres -a claude-code --env "DATABASE_URL=..."

npx agent-install@latest mcp list           # list installed MCP servers
npx agent-install@latest mcp remove <name>  # remove by server name
```

### AGENTS.md

```bash
npx agent-install@latest agents-md init
npx agent-install@latest agents-md set-section "Testing" --body "Run pnpm test"
npx agent-install@latest agents-md remove-section "Testing"
npx agent-install@latest agents-md symlink-claude
npx agent-install@latest agents-md read
```

## Node API

You can also import each surface from its own subpath:

```ts
import * as skill from "agent-install/skill";
import * as mcp from "agent-install/mcp";
import * as agentsMd from "agent-install/agents-md";
```

### Skills

A skill is a `SKILL.md` file that an agent picks up to trigger behavior. `skill.add` parses a source (local path, GitHub repo, or URL), fetches it, and installs every discovered `SKILL.md` into each selected agent.

```ts
import { skill } from "agent-install";

const result = await skill.add({
  source: "./skills/react-grab",
  agents: ["claude-code", "cursor"],
});

result.installed; // InstalledSkillRecord[]
result.failed; // FailedSkillRecord[]
```

Other useful exports:

```ts
skill.discover(dir); // find SKILL.md files in a directory
skill.parseSource(spec); // parse a source string into a ParsedSkillSource
skill.detectInstalledSkillAgents();
skill.installSkillForAgent(skill, agent, opts);
```

### MCP servers

`mcp.add` parses a source (remote URL, npm package, or raw command), builds an `McpServerConfig`, and writes it into each selected agent's native config file (JSON, JSONC, YAML, or TOML). JSONC writes preserve existing comments.

```ts
import { mcp } from "agent-install";

mcp.add({
  source: "https://mcp.context7.com/mcp",
  agents: ["cursor", "claude-code"],
  name: "context7",
});

mcp.add({
  source: "@modelcontextprotocol/server-postgres",
  agents: ["claude-code"],
  name: "postgres",
  env: { DATABASE_URL: process.env.DATABASE_URL ?? "" },
});

mcp.list({ agents: ["cursor"] });
mcp.remove({ name: "context7", agents: ["cursor"] });
```

Other useful exports:

```ts
mcp.parseSource(spec);
mcp.buildMcpServerConfig(parsed, opts);
mcp.installMcpServerForAgent(name, config, agent, opts);
```

### AGENTS.md

`agentsMd` reads, upserts, and removes sections in [AGENTS.md](https://agents.md/) and its per-agent variants (`CLAUDE.md`, `GEMINI.md`, `.cursor/rules/`, etc.) without losing surrounding content.

```ts
import { agentsMd } from "agent-install";

agentsMd.setSection({
  heading: "React Grab",
  body: "Run `npx grab@latest` to set up React Grab.",
  placement: "append",
});

agentsMd.removeSection({ heading: "Old section" });
await agentsMd.symlinkClaude();
```

Other useful exports:

```ts
agentsMd.read({ agent: "cursor" });
agentsMd.write({ content: "..." });
agentsMd.parseSections(content);
agentsMd.findSection(sections, "Testing");
agentsMd.resolveAgentsMdFilePath({ agent: "claude-code" });
```

### Subpath exports

| Import                    | Surface                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `agent-install`           | All three surfaces as `skill`, `mcp`, `agentsMd` namespaces (+ flat skill exports) |
| `agent-install/skill`     | Skill surface only                                                                 |
| `agent-install/mcp`       | MCP surface only                                                                   |
| `agent-install/agents-md` | AGENTS.md surface (kebab-case path, import as `agentsMd`)                          |

Every short-name verb has a long-form alias if you prefer it: `skill.add` is `skill.installSkillsFromSource`, `mcp.add` is `mcp.installMcpServer`, `agentsMd.setSection` is `agentsMd.upsertAgentsMdSection`, and so on.

## Source formats

### Skill sources

`skill.add` accepts a wide range of sources. Anything that resolves to a git URL is shallow-cloned into a temp directory, scanned for `SKILL.md` files, and installed.

```
# Local
./skills/my-skill                             # local path
/abs/path/to/skill                            # absolute path

# GitHub
owner/repo                                    # shorthand
owner/repo/path/to/skill                      # with subpath
owner/repo@skill-name                         # with skill filter
owner/repo#branch                             # with git ref
github:owner/repo                             # explicit prefix
https://github.com/owner/repo                 # full URL
https://github.com/owner/repo/tree/main/skills/foo

# GitLab
gitlab:owner/repo                             # shorthand
gitlab:owner/repo/path/to/skill               # with subpath
https://gitlab.com/owner/repo                 # full URL
https://gitlab.com/owner/repo/-/tree/main/skills/foo

# SSH (preserves SSH URL for clone, useful for private repos)
git@github.com:owner/repo.git
git@gitlab.com:owner/repo.git
git@github.com:owner/repo.git#main@my-skill   # with ref + skill filter

# Any other git remote (Bitbucket, self-hosted, etc.)
https://git.example.com/owner/repo.git
git@bitbucket.org:owner/repo.git

# Direct SKILL.md URL
https://example.com/path/SKILL.md

# Well-known skills endpoint (RFC 8615)
# Auto-discovers /.well-known/agent-skills/index.json (or /.well-known/skills/ as fallback)
https://docs.example.com
https://docs.example.com/.well-known/agent-skills/my-skill   # specific skill
```

`skill.add` also reads `.claude-plugin/marketplace.json` and `.claude-plugin/plugin.json` from any cloned source, so skills declared by Claude Code plugin manifests are picked up automatically and tagged with their parent plugin name.

### MCP sources

```
https://mcp.context7.com/mcp                  # remote HTTP
https://mcp.example.com/sse (+ transport: "sse")
@modelcontextprotocol/server-postgres         # npm package (wrapped in npx -y)
"node /path/to/server.js --port 3000"         # raw command
```

## Supported agents

| Surface   | Agents                                                                                                                                                                                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skills    | 50+ agents incl. Claude Code, Cursor, Codex, OpenCode, Gemini CLI, GitHub Copilot, Amp, Antigravity, Augment, Cline, Continue, Crush, Factory Droid, Goose, Junie, Kilo, Kiro CLI, OpenClaw, Pi, Roo, Trae, Warp, Zencoder, universal          |
| MCP       | Claude Code, Claude Desktop, Cursor, Codex, Cline (ext + CLI), VS Code, GitHub Copilot CLI, Gemini CLI, Goose, OpenCode, Zed, Antigravity, MCPorter                                                                                            |
| AGENTS.md | Universal, Claude Code (CLAUDE.md), Gemini CLI (GEMINI.md), Cursor (.cursor/rules), Codex, OpenCode, Aider                                                                                                                                     |

The full list of skill agents lives in [`packages/agent-install/src/skill/agents.ts`](./packages/agent-install/src/skill/agents.ts). Pass `-a <name>` to target specific agents (or `-a '*'` for all).

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm typecheck
```

Single package at [`packages/agent-install`](./packages/agent-install).

## Resources

Found a bug? Open an issue on the [issue tracker](https://github.com/aidenybai/skill-install/issues). Pull requests welcome.

### License

agent-install is MIT-licensed open-source software.

## Acknowledgements

Prior work that inspired and informed `agent-install`:

- [vercel-labs/skills](https://github.com/vercel-labs/skills) - the Agent Skills specification and reference skills.
- [neondatabase/add-mcp](https://github.com/neondatabase/add-mcp) - one-shot MCP server installer across coding agents.
- [supermemoryai/install-mcp](https://github.com/supermemoryai/install-mcp) - MCP installer CLI with OAuth and multi-client support.
- [ahmadawais/add-skill](https://github.com/ahmadawais/add-skill) - installing agent skills from any git repository.
