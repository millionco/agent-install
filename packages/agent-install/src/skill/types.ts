export type SkillAgentType =
  | "adal"
  | "aider-desk"
  | "amp"
  | "antigravity"
  | "augment"
  | "bob"
  | "claude-code"
  | "cline"
  | "codearts-agent"
  | "codebuddy"
  | "codemaker"
  | "codestudio"
  | "codex"
  | "command-code"
  | "continue"
  | "cortex"
  | "crush"
  | "cursor"
  | "deepagents"
  | "devin"
  | "dexto"
  | "droid"
  | "firebender"
  | "forgecode"
  | "gemini-cli"
  | "github-copilot"
  | "goose"
  | "iflow-cli"
  | "junie"
  | "kilo"
  | "kimi-cli"
  | "kiro-cli"
  | "kode"
  | "mcpjam"
  | "mistral-vibe"
  | "mux"
  | "neovate"
  | "openclaw"
  | "opencode"
  | "openhands"
  | "pi"
  | "pochi"
  | "qoder"
  | "qwen-code"
  | "replit"
  | "roo"
  | "rovodev"
  | "tabnine-cli"
  | "trae"
  | "trae-cn"
  | "universal"
  | "warp"
  | "zencoder";

export type SkillSourceType = "local" | "github" | "gitlab" | "git" | "url" | "well-known";

export type InstallMode = "symlink" | "copy";

export interface ParsedSkillSource {
  type: SkillSourceType;
  url: string;
  localPath?: string;
  subpath?: string;
  ref?: string;
  skillFilter?: string;
}

export interface Skill {
  name: string;
  description: string;
  path: string;
  rawContent: string;
  metadata?: Record<string, unknown>;
  pluginName?: string;
}

export interface SkillAgentConfig {
  name: SkillAgentType;
  displayName: string;
  skillsDir: string;
  globalSkillsDir: string | undefined;
  detectInstalled: () => Promise<boolean>;
  isUniversal?: boolean;
}

export interface InstallSkillsFromSourceOptions {
  source: string;
  cwd?: string;
  agents?: SkillAgentType[];
  skills?: string[];
  mode?: InstallMode;
  global?: boolean;
}

export interface InstalledSkillRecord {
  skill: string;
  agent: SkillAgentType;
  path: string;
  canonicalPath?: string;
  mode: InstallMode;
  symlinkFailed?: boolean;
}

export interface FailedSkillRecord {
  skill: string;
  agent: SkillAgentType;
  error: string;
}

export interface SkillInstallResult {
  installed: InstalledSkillRecord[];
  failed: FailedSkillRecord[];
  skills: Skill[];
}
