import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { xdgConfigHome } from "../utils/xdg-config-home.ts";
import { CANONICAL_SKILLS_DIR } from "./constants.ts";
import type { SkillAgentConfig, SkillAgentType } from "./types.ts";

const home = homedir();
const configHome = xdgConfigHome();
const codexHome = process.env.CODEX_HOME?.trim() || join(home, ".codex");
const claudeHome = process.env.CLAUDE_CONFIG_DIR?.trim() || join(home, ".claude");
const vibeHome = process.env.VIBE_HOME?.trim() || join(home, ".vibe");

// OpenClaw was renamed twice (.moltbot → .clawdbot → .openclaw); pick whichever
// directory the user actually has so installs land where the agent will read them.
const resolveOpenClawGlobalSkillsDir = (): string => {
  if (existsSync(join(home, ".openclaw"))) return join(home, ".openclaw/skills");
  if (existsSync(join(home, ".clawdbot"))) return join(home, ".clawdbot/skills");
  if (existsSync(join(home, ".moltbot"))) return join(home, ".moltbot/skills");
  return join(home, ".openclaw/skills");
};

const detectOpenClaw = (): boolean =>
  existsSync(join(home, ".openclaw")) ||
  existsSync(join(home, ".clawdbot")) ||
  existsSync(join(home, ".moltbot"));

export const skillAgents: Record<SkillAgentType, SkillAgentConfig> = {
  adal: {
    name: "adal",
    displayName: "AdaL",
    skillsDir: ".adal/skills",
    globalSkillsDir: join(home, ".adal/skills"),
    detectInstalled: async () => existsSync(join(home, ".adal")),
  },
  "aider-desk": {
    name: "aider-desk",
    displayName: "AiderDesk",
    skillsDir: ".aider-desk/skills",
    globalSkillsDir: join(home, ".aider-desk/skills"),
    detectInstalled: async () => existsSync(join(home, ".aider-desk")),
  },
  amp: {
    name: "amp",
    displayName: "Amp",
    skillsDir: CANONICAL_SKILLS_DIR,
    globalSkillsDir: join(configHome, "agents/skills"),
    detectInstalled: async () => existsSync(join(configHome, "amp")),
    isUniversal: true,
  },
  antigravity: {
    name: "antigravity",
    displayName: "Antigravity",
    skillsDir: CANONICAL_SKILLS_DIR,
    globalSkillsDir: join(home, ".gemini/antigravity/skills"),
    detectInstalled: async () => existsSync(join(home, ".gemini/antigravity")),
    isUniversal: true,
  },
  augment: {
    name: "augment",
    displayName: "Augment",
    skillsDir: ".augment/skills",
    globalSkillsDir: join(home, ".augment/skills"),
    detectInstalled: async () => existsSync(join(home, ".augment")),
  },
  bob: {
    name: "bob",
    displayName: "IBM Bob",
    skillsDir: ".bob/skills",
    globalSkillsDir: join(home, ".bob/skills"),
    detectInstalled: async () => existsSync(join(home, ".bob")),
  },
  "claude-code": {
    name: "claude-code",
    displayName: "Claude Code",
    skillsDir: ".claude/skills",
    globalSkillsDir: join(claudeHome, "skills"),
    detectInstalled: async () => existsSync(claudeHome),
  },
  cline: {
    name: "cline",
    displayName: "Cline",
    skillsDir: CANONICAL_SKILLS_DIR,
    globalSkillsDir: join(home, ".agents/skills"),
    detectInstalled: async () => existsSync(join(home, ".cline")),
    isUniversal: true,
  },
  "codearts-agent": {
    name: "codearts-agent",
    displayName: "CodeArts Agent",
    skillsDir: ".codeartsdoer/skills",
    globalSkillsDir: join(home, ".codeartsdoer/skills"),
    detectInstalled: async () => existsSync(join(home, ".codeartsdoer")),
  },
  codebuddy: {
    name: "codebuddy",
    displayName: "CodeBuddy",
    skillsDir: ".codebuddy/skills",
    globalSkillsDir: join(home, ".codebuddy/skills"),
    detectInstalled: async () =>
      existsSync(join(process.cwd(), ".codebuddy")) || existsSync(join(home, ".codebuddy")),
  },
  codemaker: {
    name: "codemaker",
    displayName: "Codemaker",
    skillsDir: ".codemaker/skills",
    globalSkillsDir: join(home, ".codemaker/skills"),
    detectInstalled: async () => existsSync(join(home, ".codemaker")),
  },
  codestudio: {
    name: "codestudio",
    displayName: "Code Studio",
    skillsDir: ".codestudio/skills",
    globalSkillsDir: join(home, ".codestudio/skills"),
    detectInstalled: async () => existsSync(join(home, ".codestudio")),
  },
  codex: {
    name: "codex",
    displayName: "Codex",
    skillsDir: CANONICAL_SKILLS_DIR,
    globalSkillsDir: join(codexHome, "skills"),
    detectInstalled: async () => existsSync(codexHome) || existsSync("/etc/codex"),
    isUniversal: true,
  },
  "command-code": {
    name: "command-code",
    displayName: "Command Code",
    skillsDir: ".commandcode/skills",
    globalSkillsDir: join(home, ".commandcode/skills"),
    detectInstalled: async () => existsSync(join(home, ".commandcode")),
  },
  continue: {
    name: "continue",
    displayName: "Continue",
    skillsDir: ".continue/skills",
    globalSkillsDir: join(home, ".continue/skills"),
    detectInstalled: async () =>
      existsSync(join(process.cwd(), ".continue")) || existsSync(join(home, ".continue")),
  },
  cortex: {
    name: "cortex",
    displayName: "Cortex Code",
    skillsDir: ".cortex/skills",
    globalSkillsDir: join(home, ".snowflake/cortex/skills"),
    detectInstalled: async () => existsSync(join(home, ".snowflake/cortex")),
  },
  crush: {
    name: "crush",
    displayName: "Crush",
    skillsDir: ".crush/skills",
    globalSkillsDir: join(configHome, "crush/skills"),
    detectInstalled: async () => existsSync(join(configHome, "crush")),
  },
  cursor: {
    name: "cursor",
    displayName: "Cursor",
    skillsDir: CANONICAL_SKILLS_DIR,
    globalSkillsDir: join(home, ".cursor/skills"),
    detectInstalled: async () => existsSync(join(home, ".cursor")),
    isUniversal: true,
  },
  deepagents: {
    name: "deepagents",
    displayName: "Deep Agents",
    skillsDir: CANONICAL_SKILLS_DIR,
    globalSkillsDir: join(home, ".deepagents/agent/skills"),
    detectInstalled: async () => existsSync(join(home, ".deepagents")),
    isUniversal: true,
  },
  devin: {
    name: "devin",
    displayName: "Devin",
    skillsDir: CANONICAL_SKILLS_DIR,
    globalSkillsDir: join(configHome, "devin/skills"),
    detectInstalled: async () => existsSync(join(configHome, "devin")),
    isUniversal: true,
  },
  dexto: {
    name: "dexto",
    displayName: "Dexto",
    skillsDir: CANONICAL_SKILLS_DIR,
    globalSkillsDir: join(home, ".agents/skills"),
    detectInstalled: async () => existsSync(join(home, ".dexto")),
    isUniversal: true,
  },
  droid: {
    name: "droid",
    displayName: "Factory Droid",
    skillsDir: ".factory/skills",
    globalSkillsDir: join(home, ".factory/skills"),
    detectInstalled: async () => existsSync(join(home, ".factory")),
  },
  firebender: {
    name: "firebender",
    displayName: "Firebender",
    skillsDir: CANONICAL_SKILLS_DIR,
    globalSkillsDir: join(home, ".firebender/skills"),
    detectInstalled: async () => existsSync(join(home, ".firebender")),
    isUniversal: true,
  },
  forgecode: {
    name: "forgecode",
    displayName: "ForgeCode",
    skillsDir: ".forge/skills",
    globalSkillsDir: join(home, ".forge/skills"),
    detectInstalled: async () => existsSync(join(home, ".forge")),
  },
  "gemini-cli": {
    name: "gemini-cli",
    displayName: "Gemini CLI",
    skillsDir: CANONICAL_SKILLS_DIR,
    globalSkillsDir: join(home, ".gemini/skills"),
    detectInstalled: async () => existsSync(join(home, ".gemini")),
    isUniversal: true,
  },
  "github-copilot": {
    name: "github-copilot",
    displayName: "GitHub Copilot",
    skillsDir: CANONICAL_SKILLS_DIR,
    globalSkillsDir: join(home, ".copilot/skills"),
    detectInstalled: async () => existsSync(join(home, ".copilot")),
    isUniversal: true,
  },
  goose: {
    name: "goose",
    displayName: "Goose",
    skillsDir: ".goose/skills",
    globalSkillsDir: join(configHome, "goose/skills"),
    detectInstalled: async () => existsSync(join(configHome, "goose")),
  },
  "iflow-cli": {
    name: "iflow-cli",
    displayName: "iFlow CLI",
    skillsDir: ".iflow/skills",
    globalSkillsDir: join(home, ".iflow/skills"),
    detectInstalled: async () => existsSync(join(home, ".iflow")),
  },
  junie: {
    name: "junie",
    displayName: "Junie",
    skillsDir: ".junie/skills",
    globalSkillsDir: join(home, ".junie/skills"),
    detectInstalled: async () => existsSync(join(home, ".junie")),
  },
  kilo: {
    name: "kilo",
    displayName: "Kilo Code",
    skillsDir: ".kilocode/skills",
    globalSkillsDir: join(home, ".kilocode/skills"),
    detectInstalled: async () => existsSync(join(home, ".kilocode")),
  },
  "kimi-cli": {
    name: "kimi-cli",
    displayName: "Kimi Code CLI",
    skillsDir: CANONICAL_SKILLS_DIR,
    globalSkillsDir: join(configHome, "agents/skills"),
    detectInstalled: async () => existsSync(join(home, ".kimi")),
    isUniversal: true,
  },
  "kiro-cli": {
    name: "kiro-cli",
    displayName: "Kiro CLI",
    skillsDir: ".kiro/skills",
    globalSkillsDir: join(home, ".kiro/skills"),
    detectInstalled: async () => existsSync(join(home, ".kiro")),
  },
  kode: {
    name: "kode",
    displayName: "Kode",
    skillsDir: ".kode/skills",
    globalSkillsDir: join(home, ".kode/skills"),
    detectInstalled: async () => existsSync(join(home, ".kode")),
  },
  mcpjam: {
    name: "mcpjam",
    displayName: "MCPJam",
    skillsDir: ".mcpjam/skills",
    globalSkillsDir: join(home, ".mcpjam/skills"),
    detectInstalled: async () => existsSync(join(home, ".mcpjam")),
  },
  "mistral-vibe": {
    name: "mistral-vibe",
    displayName: "Mistral Vibe",
    skillsDir: ".vibe/skills",
    globalSkillsDir: join(vibeHome, "skills"),
    detectInstalled: async () => existsSync(vibeHome),
  },
  mux: {
    name: "mux",
    displayName: "Mux",
    skillsDir: ".mux/skills",
    globalSkillsDir: join(home, ".mux/skills"),
    detectInstalled: async () => existsSync(join(home, ".mux")),
  },
  neovate: {
    name: "neovate",
    displayName: "Neovate",
    skillsDir: ".neovate/skills",
    globalSkillsDir: join(home, ".neovate/skills"),
    detectInstalled: async () => existsSync(join(home, ".neovate")),
  },
  openclaw: {
    name: "openclaw",
    displayName: "OpenClaw",
    skillsDir: "skills",
    globalSkillsDir: resolveOpenClawGlobalSkillsDir(),
    detectInstalled: async () => detectOpenClaw(),
  },
  opencode: {
    name: "opencode",
    displayName: "OpenCode",
    skillsDir: CANONICAL_SKILLS_DIR,
    globalSkillsDir: join(configHome, "opencode/skills"),
    detectInstalled: async () => existsSync(join(configHome, "opencode")),
    isUniversal: true,
  },
  openhands: {
    name: "openhands",
    displayName: "OpenHands",
    skillsDir: ".openhands/skills",
    globalSkillsDir: join(home, ".openhands/skills"),
    detectInstalled: async () => existsSync(join(home, ".openhands")),
  },
  pi: {
    name: "pi",
    displayName: "Pi",
    skillsDir: CANONICAL_SKILLS_DIR,
    globalSkillsDir: join(home, ".pi/agent/skills"),
    detectInstalled: async () => existsSync(join(home, ".pi")),
    isUniversal: true,
  },
  pochi: {
    name: "pochi",
    displayName: "Pochi",
    skillsDir: ".pochi/skills",
    globalSkillsDir: join(home, ".pochi/skills"),
    detectInstalled: async () => existsSync(join(home, ".pochi")),
  },
  qoder: {
    name: "qoder",
    displayName: "Qoder",
    skillsDir: ".qoder/skills",
    globalSkillsDir: join(home, ".qoder/skills"),
    detectInstalled: async () => existsSync(join(home, ".qoder")),
  },
  "qwen-code": {
    name: "qwen-code",
    displayName: "Qwen Code",
    skillsDir: ".qwen/skills",
    globalSkillsDir: join(home, ".qwen/skills"),
    detectInstalled: async () => existsSync(join(home, ".qwen")),
  },
  replit: {
    name: "replit",
    displayName: "Replit",
    skillsDir: CANONICAL_SKILLS_DIR,
    globalSkillsDir: join(configHome, "agents/skills"),
    detectInstalled: async () => existsSync(join(process.cwd(), ".replit")),
    isUniversal: true,
  },
  roo: {
    name: "roo",
    displayName: "Roo Code",
    skillsDir: ".roo/skills",
    globalSkillsDir: join(home, ".roo/skills"),
    detectInstalled: async () => existsSync(join(home, ".roo")),
  },
  rovodev: {
    name: "rovodev",
    displayName: "Rovo Dev",
    skillsDir: ".rovodev/skills",
    globalSkillsDir: join(home, ".rovodev/skills"),
    detectInstalled: async () => existsSync(join(home, ".rovodev")),
  },
  "tabnine-cli": {
    name: "tabnine-cli",
    displayName: "Tabnine CLI",
    skillsDir: ".tabnine/agent/skills",
    globalSkillsDir: join(home, ".tabnine/agent/skills"),
    detectInstalled: async () => existsSync(join(home, ".tabnine")),
  },
  trae: {
    name: "trae",
    displayName: "Trae",
    skillsDir: ".trae/skills",
    globalSkillsDir: join(home, ".trae/skills"),
    detectInstalled: async () => existsSync(join(home, ".trae")),
  },
  "trae-cn": {
    name: "trae-cn",
    displayName: "Trae CN",
    skillsDir: ".trae/skills",
    globalSkillsDir: join(home, ".trae-cn/skills"),
    detectInstalled: async () => existsSync(join(home, ".trae-cn")),
  },
  universal: {
    name: "universal",
    displayName: "Universal",
    skillsDir: CANONICAL_SKILLS_DIR,
    globalSkillsDir: join(home, ".agents/skills"),
    detectInstalled: async () => false,
    isUniversal: true,
  },
  warp: {
    name: "warp",
    displayName: "Warp",
    skillsDir: CANONICAL_SKILLS_DIR,
    globalSkillsDir: join(home, ".agents/skills"),
    detectInstalled: async () => existsSync(join(home, ".warp")),
    isUniversal: true,
  },
  zencoder: {
    name: "zencoder",
    displayName: "Zencoder",
    skillsDir: ".zencoder/skills",
    globalSkillsDir: join(home, ".zencoder/skills"),
    detectInstalled: async () => existsSync(join(home, ".zencoder")),
  },
};

export const getSkillAgentConfig = (agentType: SkillAgentType): SkillAgentConfig =>
  skillAgents[agentType];

export const isUniversalSkillAgent = (agentType: SkillAgentType): boolean =>
  Boolean(skillAgents[agentType].isUniversal);

export const getSkillAgentDir = (
  agentType: SkillAgentType,
  options: { global?: boolean; cwd?: string } = {},
): string => {
  const agent = skillAgents[agentType];
  const isGlobal = options.global ?? false;
  if (isGlobal) return agent.globalSkillsDir ?? join(home, agent.skillsDir);
  return join(options.cwd ?? process.cwd(), agent.skillsDir);
};

const agentConfigEntries = (): Array<[SkillAgentType, SkillAgentConfig]> =>
  Object.values(skillAgents).map((config) => [config.name, config]);

export const getSkillAgentTypes = (): SkillAgentType[] =>
  agentConfigEntries().map(([name]) => name);

export const isSkillAgentType = (value: string): value is SkillAgentType => value in skillAgents;

export const getUniversalSkillAgents = (): SkillAgentType[] =>
  agentConfigEntries()
    .filter(([name, config]) => config.isUniversal && name !== "universal")
    .map(([name]) => name);

export const getNonUniversalSkillAgents = (): SkillAgentType[] =>
  agentConfigEntries()
    .filter(([, config]) => !config.isUniversal)
    .map(([name]) => name);

export const detectInstalledSkillAgents = async (): Promise<SkillAgentType[]> => {
  const entries = await Promise.all(
    Object.values(skillAgents).map(async (config) => ({
      name: config.name,
      installed: await config.detectInstalled(),
    })),
  );
  return entries.filter((entry) => entry.installed).map((entry) => entry.name);
};
