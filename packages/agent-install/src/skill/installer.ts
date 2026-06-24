import { existsSync } from "node:fs";
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readdir,
  readlink,
  realpath,
  rm,
  symlink,
} from "node:fs/promises";
import { homedir, platform, tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";

import { isPathSafe } from "../utils/is-path-safe.ts";
import { sanitizeName } from "../utils/sanitize-name.ts";
import { toErrorMessage } from "../utils/to-error-message.ts";
import { getSkillAgentConfig, isUniversalSkillAgent, skillAgents } from "./agents.ts";
import { CANONICAL_SKILLS_DIR, COPY_EXCLUDE_DIRS, COPY_EXCLUDE_FILES } from "./constants.ts";
import type { InstallMode, Skill, SkillAgentType } from "./types.ts";

export interface InstallResultForAgent {
  success: boolean;
  path: string;
  canonicalPath?: string;
  mode: InstallMode;
  symlinkFailed?: boolean;
  error?: string;
}

export interface InstallSkillForAgentOptions {
  global?: boolean;
  cwd?: string;
  mode?: InstallMode;
}

export const getCanonicalSkillsDir = (isGlobal: boolean, cwd?: string): string => {
  const baseDir = isGlobal ? homedir() : cwd || process.cwd();
  return join(baseDir, CANONICAL_SKILLS_DIR);
};

export const getSkillAgentBaseDir = (
  agentType: SkillAgentType,
  isGlobal: boolean,
  cwd?: string,
): string => {
  if (isUniversalSkillAgent(agentType)) return getCanonicalSkillsDir(isGlobal, cwd);

  const agent = getSkillAgentConfig(agentType);
  const baseDir = isGlobal ? homedir() : cwd || process.cwd();
  if (isGlobal) return agent.globalSkillsDir ?? join(baseDir, agent.skillsDir);
  return join(baseDir, agent.skillsDir);
};

const cleanAndCreateDirectory = async (path: string): Promise<void> => {
  await rm(path, { recursive: true, force: true }).catch(() => undefined);
  await mkdir(path, { recursive: true });
};

const resolveSymlinkTarget = (linkPath: string, linkTarget: string): string =>
  resolve(dirname(linkPath), linkTarget);

const resolveParentSymlinks = async (path: string): Promise<string> => {
  const resolved = resolve(path);
  const parentDir = dirname(resolved);
  const name = basename(resolved);
  try {
    const realParentDir = await realpath(parentDir);
    return join(realParentDir, name);
  } catch {
    return resolved;
  }
};

const isPathInsideBase = (basePath: string, targetPath: string): boolean => {
  const normalizedBase = resolve(basePath);
  const normalizedTarget = resolve(targetPath);
  return normalizedTarget === normalizedBase || normalizedTarget.startsWith(normalizedBase + sep);
};

const copyDirectory = async (src: string, dest: string, rootSrc = src): Promise<void> => {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  await Promise.all(
    entries
      .filter(
        (entry) =>
          !COPY_EXCLUDE_FILES.has(entry.name) &&
          !(entry.isDirectory() && COPY_EXCLUDE_DIRS.has(entry.name)),
      )
      .map(async (entry) => {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);

        if (entry.isSymbolicLink()) {
          const linkRealPath = await realpath(srcPath).catch(() => null);
          if (!linkRealPath || !isPathInsideBase(rootSrc, linkRealPath)) return;
          await cp(srcPath, destPath, { dereference: true, recursive: true });
          return;
        }

        if (entry.isDirectory()) {
          await copyDirectory(srcPath, destPath, rootSrc);
          return;
        }

        await cp(srcPath, destPath, { dereference: false, recursive: true });
      }),
  );
};

const resolveExistingPath = async (path: string): Promise<string> =>
  realpath(path).catch(() => resolve(path));

const directoriesOverlap = (source: string, dest: string): boolean =>
  source === dest || isPathInsideBase(dest, source) || isPathInsideBase(source, dest);

const syncDirectory = async (source: string, dest: string): Promise<void> => {
  const [realSource, realDest] = await Promise.all([
    resolveExistingPath(source),
    resolveExistingPath(dest),
  ]);

  if (realSource === realDest) return;

  if (directoriesOverlap(realSource, realDest)) {
    const staging = await mkdtemp(join(tmpdir(), "agent-install-stage-"));
    try {
      await copyDirectory(realSource, staging);
      await cleanAndCreateDirectory(dest);
      await copyDirectory(staging, dest);
    } finally {
      await rm(staging, { recursive: true, force: true }).catch(() => undefined);
    }
    return;
  }

  await cleanAndCreateDirectory(dest);
  await copyDirectory(source, dest);
};

const isLoopError = (error: unknown): boolean =>
  Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code: string }).code === "ELOOP",
  );

const createSymlink = async (target: string, linkPath: string): Promise<boolean> => {
  try {
    const resolvedTarget = resolve(target);
    const resolvedLinkPath = resolve(linkPath);

    const [realTarget, realLinkPath] = await Promise.all([
      realpath(resolvedTarget).catch(() => resolvedTarget),
      realpath(resolvedLinkPath).catch(() => resolvedLinkPath),
    ]);
    if (realTarget === realLinkPath) return true;

    const [realTargetWithParents, realLinkPathWithParents] = await Promise.all([
      resolveParentSymlinks(target),
      resolveParentSymlinks(linkPath),
    ]);
    if (realTargetWithParents === realLinkPathWithParents) return true;

    try {
      const stats = await lstat(linkPath);
      if (stats.isSymbolicLink()) {
        const existingTarget = await readlink(linkPath);
        if (resolveSymlinkTarget(linkPath, existingTarget) === resolvedTarget) return true;
        await rm(linkPath);
      } else {
        await rm(linkPath, { recursive: true });
      }
    } catch (error) {
      if (isLoopError(error)) await rm(linkPath, { force: true }).catch(() => {});
    }

    const linkDir = dirname(linkPath);
    await mkdir(linkDir, { recursive: true });

    const realLinkDir = await resolveParentSymlinks(linkDir);
    const relativePath = relative(realLinkDir, target);
    const symlinkType = platform() === "win32" ? "junction" : undefined;

    await symlink(relativePath, linkPath, symlinkType);
    return true;
  } catch {
    return false;
  }
};

const installByCopy = async (skill: Skill, destination: string): Promise<InstallResultForAgent> => {
  await syncDirectory(skill.path, destination);
  return { success: true, path: destination, mode: "copy" };
};

const installBySymlink = async (
  skill: Skill,
  agentType: SkillAgentType,
  canonicalDir: string,
  agentDir: string,
  isGlobal: boolean,
): Promise<InstallResultForAgent> => {
  await syncDirectory(skill.path, canonicalDir);

  if (isGlobal && isUniversalSkillAgent(agentType)) {
    return { success: true, path: canonicalDir, canonicalPath: canonicalDir, mode: "symlink" };
  }

  if (await createSymlink(canonicalDir, agentDir)) {
    return { success: true, path: agentDir, canonicalPath: canonicalDir, mode: "symlink" };
  }

  await syncDirectory(skill.path, agentDir);
  return {
    success: true,
    path: agentDir,
    canonicalPath: canonicalDir,
    mode: "symlink",
    symlinkFailed: true,
  };
};

export const installSkillForAgent = async (
  skill: Skill,
  agentType: SkillAgentType,
  options: InstallSkillForAgentOptions = {},
): Promise<InstallResultForAgent> => {
  const agent = skillAgents[agentType];
  const isGlobal = options.global ?? false;
  const cwd = options.cwd || process.cwd();
  const installMode = options.mode ?? "symlink";

  if (isGlobal && agent.globalSkillsDir === undefined) {
    return {
      success: false,
      path: "",
      mode: installMode,
      error: `${agent.displayName} does not support global skill installation`,
    };
  }

  const skillName = sanitizeName(skill.name || basename(skill.path));
  const canonicalBase = getCanonicalSkillsDir(isGlobal, cwd);
  const canonicalDir = join(canonicalBase, skillName);
  const agentBase = getSkillAgentBaseDir(agentType, isGlobal, cwd);
  const agentDir = join(agentBase, skillName);

  if (!isPathSafe(canonicalBase, canonicalDir) || !isPathSafe(agentBase, agentDir)) {
    return {
      success: false,
      path: agentDir,
      mode: installMode,
      error: "Invalid skill name: potential path traversal detected",
    };
  }

  try {
    return installMode === "copy"
      ? await installByCopy(skill, agentDir)
      : await installBySymlink(skill, agentType, canonicalDir, agentDir, isGlobal);
  } catch (error) {
    return {
      success: false,
      path: agentDir,
      mode: installMode,
      error: toErrorMessage(error),
    };
  }
};

export const isSkillInstalledForAgent = async (
  skillName: string,
  agentType: SkillAgentType,
  options: { global?: boolean; cwd?: string } = {},
): Promise<boolean> => {
  const agentBase = getSkillAgentBaseDir(
    agentType,
    options.global ?? false,
    options.cwd || process.cwd(),
  );
  return existsSync(join(agentBase, sanitizeName(skillName)));
};
