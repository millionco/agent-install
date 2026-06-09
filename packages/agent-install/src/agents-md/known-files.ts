import type { AgentsMdAgent, AgentsMdFileDescriptor } from "./types.ts";

export const agentsMdFiles: Record<AgentsMdAgent, AgentsMdFileDescriptor> = {
  universal: {
    agent: "universal",
    displayName: "AGENTS.md (universal)",
    filename: "AGENTS.md",
    fileExtension: "md",
    supportsMultipleFiles: false,
  },
  "claude-code": {
    agent: "claude-code",
    displayName: "Claude Code (CLAUDE.md)",
    filename: "CLAUDE.md",
    fileExtension: "md",
    supportsMultipleFiles: false,
    aliasOf: "AGENTS.md",
  },
  cursor: {
    agent: "cursor",
    displayName: "Cursor Rules (.cursor/rules)",
    filename: "cursor.mdc",
    supplementaryFilenames: [".cursorrules"],
    subdirectory: ".cursor/rules",
    fileExtension: "mdc",
    supportsMultipleFiles: true,
  },
  codex: {
    agent: "codex",
    displayName: "Codex (AGENTS.md)",
    filename: "AGENTS.md",
    fileExtension: "md",
    supportsMultipleFiles: false,
    aliasOf: "AGENTS.md",
  },
  "gemini-cli": {
    agent: "gemini-cli",
    displayName: "Gemini CLI (GEMINI.md)",
    filename: "GEMINI.md",
    fileExtension: "md",
    supportsMultipleFiles: false,
    aliasOf: "AGENTS.md",
  },
  opencode: {
    agent: "opencode",
    displayName: "OpenCode (AGENTS.md)",
    filename: "AGENTS.md",
    fileExtension: "md",
    supportsMultipleFiles: false,
    aliasOf: "AGENTS.md",
  },
  aider: {
    agent: "aider",
    displayName: "Aider (.aider.conf.yml points at AGENTS.md)",
    filename: "AGENTS.md",
    fileExtension: "md",
    supportsMultipleFiles: false,
    aliasOf: "AGENTS.md",
  },
};

export const getAgentsMdDescriptor = (agent: AgentsMdAgent): AgentsMdFileDescriptor =>
  agentsMdFiles[agent];

export const listAgentsMdDescriptors = (): AgentsMdFileDescriptor[] => Object.values(agentsMdFiles);
