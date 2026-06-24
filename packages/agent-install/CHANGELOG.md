# agent-install

## 0.0.7

### Patch Changes

- 188dddf: Fix skill re-install wiping/not updating files when the discovered source path is the same as (or overlaps) the install destination (e.g. authoring skills directly in `.agents/skills`). The copy now stages overlapping sources and is a no-op when source and destination resolve to the same path, instead of deleting the source before copying.

## 0.0.6

### Patch Changes

- 7179ba6: Remove Windsurf from supported skill and AGENTS.md agent options.
- fix

## 0.0.5

### Patch Changes

- fix

## 0.0.4

### Patch Changes

- fix

## 0.0.3

### Patch Changes

- fix

## 0.0.2

### Patch Changes

- fix

## 0.1.0

### Minor Changes

- 8e39a33: Initial public release of `agent-install`.

  Single package shipping a Node library and a CLI that install three things every
  AI coding agent consumes:
  - **Skills** — `SKILL.md` files discovered and symlinked (or copied) into each
    agent's skills directory, with a canonical copy at `.agents/skills/<name>`.
  - **MCP servers** — written into each agent's native config file across JSON
    (JSONC comment-preserving), YAML, and TOML, with per-agent transforms for
    Goose, Zed, OpenCode, Codex, VS Code, and GitHub Copilot CLI. 14 MCP hosts
    supported.
  - **AGENTS.md** — code-fence-aware section editing plus CLAUDE.md / GEMINI.md /
    `.cursor/rules/` variants and a CLAUDE.md → AGENTS.md symlink helper with a
    copy fallback on Windows.

  Subpath exports: `agent-install` (skill surface, default), `agent-install/skill`,
  `agent-install/mcp`, `agent-install/agents-md`. CLI: `agent-install skill|mcp|doc <action>`.

- c8a5dfa: Add a namespaced Node API, expand remote source support to GitLab and SSH, and
  close a hostname-spoofing parser bug.

  **API**
  - New top-level namespace exports: `import { skill, mcp, agentsMd } from "agent-install"`.
    Each surface gets short verbs that mirror the CLI: `skill.add`, `mcp.add`,
    `mcp.list`, `mcp.remove`, `agentsMd.setSection`, `agentsMd.removeSection`,
    `agentsMd.read`, `agentsMd.write`, `agentsMd.symlinkClaude`. The long-form
    names (`installSkillsFromSource`, `installMcpServer`, `upsertAgentsMdSection`,
    etc.) are kept as aliases.

  **Sources**
  - Skills can now be installed from GitLab as a first-class source: full GitLab
    repo URLs, `/-/tree/<ref>/<subpath>` URLs, the `gitlab:owner/repo` shorthand
    prefix (with subpath / `@filter` / `#ref` modifiers), and SSH URLs to
    `gitlab.com`.
  - SSH URLs to `github.com` and `gitlab.com` are now host-typed and preserved
    as the clone URL (so deploy keys and private repos keep working). New
    `gitlab` value on `SkillSourceType`.

  **Bug fix**
  - HTTPS source parsing no longer mis-parses lookalike domains. Inputs like
    `https://example-github.com/owner/repo` and `https://my-github.com/owner/repo/tree/main`
    used to be silently rewritten to `https://github.com/owner/repo.git`; they now
    fall through to a generic git source. Subpath-traversal protection (`../`)
    is still enforced via `sanitizeSubpath`.

### Patch Changes

- init
