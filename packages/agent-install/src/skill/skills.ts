import { readdir, readFile, stat } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

import { MAX_SEARCH_DEPTH, SKILL_MANIFEST_FILE, SKIP_DISCOVERY_DIRS } from "./constants.ts";
import { parseFrontmatter } from "./frontmatter.ts";
import { getPluginGroupings, getPluginSkillPaths } from "./plugin-manifest.ts";
import type { Skill } from "./types.ts";
import { isPathSafe } from "../utils/is-path-safe.ts";
import { isPlainObject } from "../utils/is-plain-object.ts";
import { sanitizeMetadata } from "../utils/sanitize-metadata.ts";

const PRIORITY_RELATIVE_PATHS: readonly string[] = [
  "",
  "skills",
  "skills/.curated",
  "skills/.experimental",
  "skills/.system",
  ".agents/skills",
  ".aider-desk/skills",
  ".augment/skills",
  ".bob/skills",
  ".claude/skills",
  ".cline/skills",
  ".codeartsdoer/skills",
  ".codebuddy/skills",
  ".codemaker/skills",
  ".codestudio/skills",
  ".codex/skills",
  ".commandcode/skills",
  ".continue/skills",
  ".cortex/skills",
  ".crush/skills",
  ".cursor/skills",
  ".factory/skills",
  ".forge/skills",
  ".gemini/skills",
  ".github/skills",
  ".goose/skills",
  ".iflow/skills",
  ".junie/skills",
  ".kilocode/skills",
  ".kiro/skills",
  ".kode/skills",
  ".mcpjam/skills",
  ".mux/skills",
  ".neovate/skills",
  ".openhands/skills",
  ".pi/skills",
  ".pochi/skills",
  ".qoder/skills",
  ".qwen/skills",
  ".roo/skills",
  ".rovodev/skills",
  ".tabnine/agent/skills",
  ".trae/skills",
  ".vibe/skills",
  ".zencoder/skills",
];

const hasSkillManifest = async (dir: string): Promise<boolean> => {
  try {
    const stats = await stat(join(dir, SKILL_MANIFEST_FILE));
    return stats.isFile();
  } catch {
    return false;
  }
};

export const parseSkillManifest = async (manifestPath: string): Promise<Skill | null> => {
  try {
    const content = await readFile(manifestPath, "utf-8");
    const { data } = parseFrontmatter(content);

    if (typeof data.name !== "string" || typeof data.description !== "string") {
      return null;
    }
    if (!data.name || !data.description) return null;

    const metadata = isPlainObject(data.metadata) ? data.metadata : undefined;

    return {
      name: sanitizeMetadata(data.name),
      description: sanitizeMetadata(data.description),
      path: dirname(manifestPath),
      rawContent: content,
      metadata,
    };
  } catch {
    return null;
  }
};

const findSkillDirs = async (dir: string, depth = 0): Promise<string[]> => {
  if (depth > MAX_SEARCH_DEPTH) return [];

  try {
    const [hasManifest, entries] = await Promise.all([
      hasSkillManifest(dir),
      readdir(dir, { withFileTypes: true }).catch(() => []),
    ]);

    const currentDir = hasManifest ? [dir] : [];

    const subDirResults = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory() && !SKIP_DISCOVERY_DIRS.has(entry.name))
        .map((entry) => findSkillDirs(join(dir, entry.name), depth + 1)),
    );

    return [...currentDir, ...subDirResults.flat()];
  } catch {
    return [];
  }
};

export interface DiscoverSkillsOptions {
  fullDepth?: boolean;
}

export const discoverSkills = async (
  basePath: string,
  subpath?: string,
  options?: DiscoverSkillsOptions,
): Promise<Skill[]> => {
  if (subpath && !isPathSafe(basePath, join(basePath, subpath))) {
    throw new Error(
      `Invalid subpath: "${subpath}" resolves outside the base directory. ` +
        `Subpath must not contain ".." segments that escape the base path.`,
    );
  }

  const searchPath = subpath ? join(basePath, subpath) : basePath;
  const seenNames = new Set<string>();
  const results: Skill[] = [];

  const pluginGroupings = await getPluginGroupings(searchPath);
  const enhanceSkill = (skill: Skill): Skill => {
    const pluginName = pluginGroupings.get(resolve(skill.path));
    return pluginName ? { ...skill, pluginName } : skill;
  };

  const pluginExtraDirs = await getPluginSkillPaths(searchPath);

  if (await hasSkillManifest(searchPath)) {
    const skill = await parseSkillManifest(join(searchPath, SKILL_MANIFEST_FILE));
    if (skill) {
      results.push(enhanceSkill(skill));
      seenNames.add(skill.name);
      if (!options?.fullDepth) return results;
    }
  }

  const prioritySearchDirs = [
    ...PRIORITY_RELATIVE_PATHS.map((relative) =>
      relative ? join(searchPath, relative) : searchPath,
    ),
    ...pluginExtraDirs,
  ];

  for (const dir of prioritySearchDirs) {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const skillDir = join(dir, entry.name);
        if (!(await hasSkillManifest(skillDir))) continue;

        const skill = await parseSkillManifest(join(skillDir, SKILL_MANIFEST_FILE));
        if (skill && !seenNames.has(skill.name)) {
          results.push(enhanceSkill(skill));
          seenNames.add(skill.name);
        }
      }
    } catch {}
  }

  if (results.length === 0 || options?.fullDepth) {
    const allSkillDirs = await findSkillDirs(searchPath);
    for (const skillDir of allSkillDirs) {
      const skill = await parseSkillManifest(join(skillDir, SKILL_MANIFEST_FILE));
      if (skill && !seenNames.has(skill.name)) {
        results.push(enhanceSkill(skill));
        seenNames.add(skill.name);
      }
    }
  }

  return results;
};

export const getSkillDisplayName = (skill: Skill): string => skill.name || basename(skill.path);

export const filterSkillsByName = (skills: Skill[], inputNames: string[]): Skill[] => {
  const normalizedInputs = inputNames.map((inputName) => inputName.toLowerCase());
  return skills.filter((skill) => {
    const name = skill.name.toLowerCase();
    const displayName = getSkillDisplayName(skill).toLowerCase();
    return normalizedInputs.some((inputName) => inputName === name || inputName === displayName);
  });
};
