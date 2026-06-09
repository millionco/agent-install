export type AgentsMdAgent =
  | "claude-code"
  | "cursor"
  | "codex"
  | "gemini-cli"
  | "opencode"
  | "aider"
  | "universal";

export interface AgentsMdFileDescriptor {
  agent: AgentsMdAgent;
  displayName: string;
  filename: string;
  supplementaryFilenames?: readonly string[];
  subdirectory?: string;
  fileExtension: "md" | "mdc" | "txt";
  supportsMultipleFiles: boolean;
  aliasOf?: "AGENTS.md";
}

export interface AgentsMdSection {
  heading: string;
  level: number;
  body: string;
  start: number;
  end: number;
}

export interface AgentsMdDocument {
  path: string;
  content: string;
  sections: AgentsMdSection[];
}

export type SectionPlacement = "append" | "prepend" | "replace";

export interface UpsertSectionOptions {
  cwd?: string;
  agent?: AgentsMdAgent;
  file?: string;
  heading: string;
  body: string;
  placement?: SectionPlacement;
  level?: number;
}

export interface RemoveSectionOptions {
  cwd?: string;
  agent?: AgentsMdAgent;
  file?: string;
  heading: string;
}

export interface ReadAgentsMdOptions {
  cwd?: string;
  agent?: AgentsMdAgent;
  file?: string;
}

export interface WriteAgentsMdOptions {
  cwd?: string;
  agent?: AgentsMdAgent;
  file?: string;
  content: string;
}
