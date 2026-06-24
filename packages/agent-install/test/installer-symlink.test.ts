import { lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "@voidzero-dev/vite-plus-test";

import { installSkillForAgent } from "../src/skill/installer.ts";

const makeSkillSource = async (root: string, name: string): Promise<string> => {
  const dir = join(root, "source-skill");
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, "SKILL.md"),
    `---\nname: ${name}\ndescription: regression fixture\n---\n`,
    "utf-8",
  );
  return dir;
};

describe("installer symlink regressions", () => {
  it("does not create a self-loop when canonical and agent paths coincide", async () => {
    const root = await mkdtemp(join(tmpdir(), "agent-install-symlink-"));
    const projectDir = join(root, "project");
    await mkdir(projectDir, { recursive: true });

    const skillName = "self-loop-skill";
    const skillDir = await makeSkillSource(root, skillName);

    try {
      const result = await installSkillForAgent(
        { name: skillName, description: "test", path: skillDir, rawContent: "" },
        "cursor",
        { cwd: projectDir, mode: "symlink", global: false },
      );
      expect(result.success).toBe(true);
      expect(result.symlinkFailed).toBeUndefined();

      const installedPath = join(projectDir, ".agents", "skills", skillName);
      const stats = await lstat(installedPath);
      expect(stats.isSymbolicLink()).toBe(false);
      expect(stats.isDirectory()).toBe(true);

      const contents = await readFile(join(installedPath, "SKILL.md"), "utf-8");
      expect(contents).toContain(`name: ${skillName}`);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("cleans a pre-existing self-loop symlink in the canonical directory", async () => {
    const root = await mkdtemp(join(tmpdir(), "agent-install-symlink-"));
    const projectDir = join(root, "project");
    await mkdir(projectDir, { recursive: true });

    const skillName = "self-loop-skill";
    const skillDir = await makeSkillSource(root, skillName);
    const canonicalDir = join(projectDir, ".agents", "skills", skillName);

    try {
      await mkdir(join(projectDir, ".agents", "skills"), { recursive: true });
      await symlink(skillName, canonicalDir);
      expect((await lstat(canonicalDir)).isSymbolicLink()).toBe(true);

      const result = await installSkillForAgent(
        { name: skillName, description: "test", path: skillDir, rawContent: "" },
        "cursor",
        { cwd: projectDir, mode: "symlink", global: false },
      );
      expect(result.success).toBe(true);

      const postStats = await lstat(canonicalDir);
      expect(postStats.isSymbolicLink()).toBe(false);
      expect(postStats.isDirectory()).toBe(true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("handles an agent skills dir that is a symlink to the canonical dir", async () => {
    const root = await mkdtemp(join(tmpdir(), "agent-install-symlink-"));
    const projectDir = join(root, "project");
    await mkdir(projectDir, { recursive: true });

    const skillName = "symlinked-dir-skill";
    const skillDir = await makeSkillSource(root, skillName);

    const canonicalBase = join(projectDir, ".agents", "skills");
    await mkdir(canonicalBase, { recursive: true });

    const claudeDir = join(projectDir, ".claude");
    await mkdir(claudeDir, { recursive: true });
    const claudeSkillsDir = join(claudeDir, "skills");
    await symlink(canonicalBase, claudeSkillsDir);

    try {
      const result = await installSkillForAgent(
        { name: skillName, description: "test", path: skillDir, rawContent: "" },
        "claude-code",
        { cwd: projectDir, mode: "symlink", global: false },
      );
      expect(result.success).toBe(true);
      expect(result.symlinkFailed).toBeUndefined();

      const canonicalSkillDir = join(canonicalBase, skillName);
      expect((await lstat(canonicalSkillDir)).isDirectory()).toBe(true);
      const canonicalContents = await readFile(join(canonicalSkillDir, "SKILL.md"), "utf-8");
      expect(canonicalContents).toContain(`name: ${skillName}`);

      const claudeSkillDir = join(claudeSkillsDir, skillName);
      const claudeContents = await readFile(join(claudeSkillDir, "SKILL.md"), "utf-8");
      expect(claudeContents).toContain(`name: ${skillName}`);

      for (const entry of await readdir(canonicalBase, { withFileTypes: true })) {
        if (entry.name !== skillName) continue;
        expect((await lstat(join(canonicalBase, entry.name))).isDirectory()).toBe(true);
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("copy mode writes an independent, non-symlink directory", async () => {
    const root = await mkdtemp(join(tmpdir(), "agent-install-symlink-"));
    const projectDir = join(root, "project");
    await mkdir(projectDir, { recursive: true });

    const skillName = "copy-skill";
    const skillDir = await makeSkillSource(root, skillName);

    try {
      const result = await installSkillForAgent(
        { name: skillName, description: "test", path: skillDir, rawContent: "" },
        "claude-code",
        { cwd: projectDir, mode: "copy", global: false },
      );
      expect(result.success).toBe(true);
      expect(result.mode).toBe("copy");

      const claudePath = join(projectDir, ".claude", "skills", skillName);
      const stats = await lstat(claudePath);
      expect(stats.isSymbolicLink()).toBe(false);
      expect(stats.isDirectory()).toBe(true);

      const contents = await readFile(join(claudePath, "SKILL.md"), "utf-8");
      expect(contents).toContain(`name: ${skillName}`);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("preserves content when the source path is the canonical destination", async () => {
    const root = await mkdtemp(join(tmpdir(), "agent-install-symlink-"));
    const projectDir = join(root, "project");
    const skillName = "in-place-skill";
    const canonicalDir = join(projectDir, ".agents", "skills", skillName);
    await mkdir(canonicalDir, { recursive: true });
    await writeFile(
      join(canonicalDir, "SKILL.md"),
      `---\nname: ${skillName}\ndescription: in place\n---\nORIGINAL BODY\n`,
      "utf-8",
    );

    try {
      const result = await installSkillForAgent(
        { name: skillName, description: "test", path: canonicalDir, rawContent: "" },
        "claude-code",
        { cwd: projectDir, mode: "symlink", global: false },
      );
      expect(result.success).toBe(true);

      const canonicalContents = await readFile(join(canonicalDir, "SKILL.md"), "utf-8");
      expect(canonicalContents).toContain("ORIGINAL BODY");

      const claudeContents = await readFile(
        join(projectDir, ".claude", "skills", skillName, "SKILL.md"),
        "utf-8",
      );
      expect(claudeContents).toContain("ORIGINAL BODY");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("rejects unsafe skill names (path traversal)", async () => {
    const root = await mkdtemp(join(tmpdir(), "agent-install-symlink-"));
    const projectDir = join(root, "project");
    await mkdir(projectDir, { recursive: true });

    const skillDir = await makeSkillSource(root, "traversal-skill");

    try {
      const result = await installSkillForAgent(
        { name: "../escape", description: "test", path: skillDir, rawContent: "" },
        "cursor",
        { cwd: projectDir, mode: "symlink", global: false },
      );
      // sanitizeName collapses "../escape" → "escape", so install still succeeds safely.
      expect(result.success).toBe(true);
      const installed = await readdir(join(projectDir, ".agents", "skills"));
      expect(installed).toEqual(["escape"]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
