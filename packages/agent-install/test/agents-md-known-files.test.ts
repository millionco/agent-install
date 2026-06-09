import { describe, expect, it } from "@voidzero-dev/vite-plus-test";

import {
  agentsMdFiles,
  getAgentsMdDescriptor,
  listAgentsMdDescriptors,
} from "../src/agents-md/known-files.ts";
import { resolveAgentsMdFilePath } from "../src/agents-md/resolve-file-path.ts";

describe("agentsMdFiles catalog", () => {
  it("has every declared agent as a key", () => {
    for (const agent of [
      "universal",
      "claude-code",
      "cursor",
      "codex",
      "gemini-cli",
      "opencode",
      "aider",
    ] as const) {
      expect(agentsMdFiles[agent]).toBeDefined();
      expect(agentsMdFiles[agent].agent).toBe(agent);
    }
  });

  it("each descriptor has the required fields", () => {
    for (const descriptor of listAgentsMdDescriptors()) {
      expect(descriptor.agent).toBeTypeOf("string");
      expect(descriptor.displayName).toBeTypeOf("string");
      expect(descriptor.filename).toBeTypeOf("string");
      expect(["md", "mdc", "txt"]).toContain(descriptor.fileExtension);
      expect(descriptor.supportsMultipleFiles).toBeTypeOf("boolean");
    }
  });

  it("getAgentsMdDescriptor returns the descriptor for claude-code", () => {
    const descriptor = getAgentsMdDescriptor("claude-code");
    expect(descriptor.filename).toBe("CLAUDE.md");
    expect(descriptor.aliasOf).toBe("AGENTS.md");
  });

  it("listAgentsMdDescriptors returns every registered descriptor", () => {
    expect(listAgentsMdDescriptors().length).toBe(Object.keys(agentsMdFiles).length);
  });
});

describe("resolveAgentsMdFilePath", () => {
  it("defaults to universal AGENTS.md in cwd", () => {
    expect(resolveAgentsMdFilePath({ cwd: "/p" })).toBe("/p/AGENTS.md");
  });

  it("resolves agent-specific filenames", () => {
    expect(resolveAgentsMdFilePath({ cwd: "/p", agent: "claude-code" })).toBe("/p/CLAUDE.md");
    expect(resolveAgentsMdFilePath({ cwd: "/p", agent: "gemini-cli" })).toBe("/p/GEMINI.md");
  });

  it("honors an agent with a subdirectory (cursor → .cursor/rules)", () => {
    expect(resolveAgentsMdFilePath({ cwd: "/p", agent: "cursor" })).toBe(
      "/p/.cursor/rules/cursor.mdc",
    );
  });

  it("treats a relative --file as project-relative", () => {
    expect(resolveAgentsMdFilePath({ cwd: "/p", file: "docs/custom.md" })).toBe(
      "/p/docs/custom.md",
    );
  });

  it("preserves absolute --file paths as-is", () => {
    expect(resolveAgentsMdFilePath({ cwd: "/p", file: "/abs/path.md" })).toBe("/abs/path.md");
  });
});
