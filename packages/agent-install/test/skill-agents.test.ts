import { describe, expect, it } from "@voidzero-dev/vite-plus-test";

import {
  detectInstalledSkillAgents,
  getNonUniversalSkillAgents,
  getSkillAgentConfig,
  getSkillAgentDir,
  getSkillAgentTypes,
  getUniversalSkillAgents,
  isSkillAgentType,
  isUniversalSkillAgent,
  skillAgents,
} from "../src/skill/agents.ts";

// Sorted snapshot of every registered agent. Update intentionally when adding
// or removing an agent — the diff is the audit trail.
const REGISTERED_AGENTS = [
  "adal",
  "aider-desk",
  "amp",
  "antigravity",
  "augment",
  "bob",
  "claude-code",
  "cline",
  "codearts-agent",
  "codebuddy",
  "codemaker",
  "codestudio",
  "codex",
  "command-code",
  "continue",
  "cortex",
  "crush",
  "cursor",
  "deepagents",
  "devin",
  "dexto",
  "droid",
  "firebender",
  "forgecode",
  "gemini-cli",
  "github-copilot",
  "goose",
  "iflow-cli",
  "junie",
  "kilo",
  "kimi-cli",
  "kiro-cli",
  "kode",
  "mcpjam",
  "mistral-vibe",
  "mux",
  "neovate",
  "openclaw",
  "opencode",
  "openhands",
  "pi",
  "pochi",
  "qoder",
  "qwen-code",
  "replit",
  "roo",
  "rovodev",
  "tabnine-cli",
  "trae",
  "trae-cn",
  "universal",
  "warp",
  "zencoder",
] as const;

describe("skillAgents registry", () => {
  it("matches the snapshot of every registered agent (sorted)", () => {
    const types = [...getSkillAgentTypes()].sort();
    expect(types).toEqual([...REGISTERED_AGENTS].sort());
  });

  it("every registered agent carries consistent metadata", () => {
    for (const type of getSkillAgentTypes()) {
      const config = getSkillAgentConfig(type);
      expect(config.name).toBe(type);
      expect(config.displayName).toBeTruthy();
      expect(config.skillsDir).toBeTruthy();
      expect(typeof config.detectInstalled).toBe("function");
    }
  });

  it("isSkillAgentType is true for every registered agent and false otherwise", () => {
    for (const agent of getSkillAgentTypes()) {
      expect(isSkillAgentType(agent)).toBe(true);
    }
    expect(isSkillAgentType("not-a-real-agent")).toBe(false);
    expect(isSkillAgentType("")).toBe(false);
  });

  it("droid is non-universal and writes to .factory/skills", () => {
    const config = getSkillAgentConfig("droid");
    expect(config.displayName).toBe("Factory Droid");
    expect(config.skillsDir).toBe(".factory/skills");
    expect(isUniversalSkillAgent("droid")).toBe(false);
    expect(getNonUniversalSkillAgents()).toContain("droid");
    expect(getUniversalSkillAgents()).not.toContain("droid");
  });

  it("pi is universal and shares the canonical .agents/skills location", () => {
    const config = getSkillAgentConfig("pi");
    expect(config.skillsDir).toBe(".agents/skills");
    expect(isUniversalSkillAgent("pi")).toBe(true);
    expect(getUniversalSkillAgents()).toContain("pi");
    expect(getNonUniversalSkillAgents()).not.toContain("pi");
  });

  it("openclaw resolves a global skills dir and detection works", async () => {
    expect(skillAgents.openclaw.globalSkillsDir).toMatch(/\.(openclaw|clawdbot|moltbot)\/skills$/);
    expect(typeof (await skillAgents.openclaw.detectInstalled())).toBe("boolean");
  });

  it("project-relative skill dir uses cwd", () => {
    expect(getSkillAgentDir("droid", { cwd: "/tmp/proj" })).toBe("/tmp/proj/.factory/skills");
    expect(getSkillAgentDir("pi", { cwd: "/tmp/proj" })).toBe("/tmp/proj/.agents/skills");
    expect(getSkillAgentDir("openclaw", { cwd: "/tmp/proj" })).toBe("/tmp/proj/skills");
  });

  it("global skill dir is set for every agent", () => {
    for (const type of getSkillAgentTypes()) {
      expect(skillAgents[type].globalSkillsDir).toBeTruthy();
    }
  });

  it("detectInstalledSkillAgents returns an array (no exceptions)", async () => {
    const installed = await detectInstalledSkillAgents();
    expect(Array.isArray(installed)).toBe(true);
  });
});
