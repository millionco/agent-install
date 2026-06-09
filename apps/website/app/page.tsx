"use client";

import { useEffect, useRef, useState } from "react";

import { CopyButton } from "@/components/copy-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { highlightCode } from "@/lib/shiki";

const formatStarCount = (count: number): string => {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(count);
};

const AGENTS = [
  { name: "Claude Code", flag: "claude-code" },
  { name: "Cursor", flag: "cursor" },
  { name: "OpenAI Codex", flag: "codex" },
  { name: "OpenCode", flag: "opencode" },
  { name: "Gemini CLI", flag: "gemini-cli" },
  { name: "GitHub Copilot", flag: "github-copilot" },
  { name: "Goose", flag: "goose" },
  { name: "Cline", flag: "cline" },
  { name: "Claude Desktop", flag: "claude-desktop" },
  { name: "VS Code", flag: "vscode" },
  { name: "Zed", flag: "zed" },
  { name: "Antigravity", flag: "antigravity" },
  { name: "Roo Code", flag: "roo" },
  { name: "Kilo Code", flag: "kilo" },
];

const buildAgentCommand = (flag: string) =>
  `npx agent-install@latest mcp add https://mcp.context7.com/mcp -a ${flag}`;

const LIBRARY_EXAMPLE = `import { skill, mcp, agentsMd } from "agent-install";

await skill.add({ source: "owner/repo", agents: ["cursor"] });
mcp.add({ source: "https://mcp.context7.com/mcp", agents: ["cursor"], name: "context7" });
agentsMd.setSection({ heading: "Testing", body: "Run pnpm test" });`;

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<"cli" | "library">("cli");
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());
  const [starCount, setStarCount] = useState<string>("");
  const [activeAgent, setActiveAgent] = useState(0);
  const [agentHighlights, setAgentHighlights] = useState<Record<string, string>>({});
  const [libraryHighlight, setLibraryHighlight] = useState<string>("");
  const commandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("https://api.github.com/repos/millionco/agent-install")
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        if (data.stargazers_count) setStarCount(formatStarCount(data.stargazers_count));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      AGENTS.map(async (agent) => ({
        flag: agent.flag,
        html: await highlightCode({ code: buildAgentCommand(agent.flag), lang: "bash" }),
      })),
    ).then((results) => {
      if (cancelled) return;
      const next: Record<string, string> = {};
      for (const result of results) next[result.flag] = result.html;
      setAgentHighlights(next);
    });
    highlightCode({ code: LIBRARY_EXAMPLE, lang: "typescript" }).then((html) => {
      if (!cancelled) setLibraryHighlight(html);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const commandText =
    activeTab === "cli" ? "npx agent-install@latest --help" : "npm install agent-install";

  const handleSelectCommand = () => {
    if (!commandRef.current) return;
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(commandRef.current);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  return (
    <div className="[font-synthesis:none] overflow-x-clip antialiased min-h-screen bg-[color(display-p3_0.966_0.966_0.966)] flex flex-col items-center">
      <div className="home-page-below-hero w-full flex flex-col items-center">
        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0">
          <div className="flex flex-col gap-[5px] mt-16 sm:mt-24">
            <div
              className="flex items-center gap-2.5 [white-space-collapse:preserve] font-['OpenRunde-Semibold','Open_Runde',system-ui,sans-serif] font-semibold text-[24px]/9.5 text-[#1a1a1a]"
              style={{ marginBottom: "-1px" }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12C1.25 6.06294 6.06294 1.25 12 1.25ZM11.999 6.5C11.4469 6.50025 10.999 6.94787 10.999 7.5V14.5488C10.789 14.3294 10.5719 14.0906 10.3584 13.8447C9.93953 13.3623 9.54974 12.8763 9.26367 12.5098C9.12118 12.3272 8.88452 12.0129 8.80469 11.9072C8.47722 11.4628 7.85085 11.3672 7.40625 11.6943C6.962 12.0218 6.8674 12.6482 7.19434 13.0928C7.27962 13.2057 7.53751 13.548 7.6875 13.7402C7.9866 14.1235 8.39951 14.638 8.84863 15.1553C9.29352 15.6677 9.79458 16.2061 10.2676 16.624C10.5028 16.8318 10.7546 17.0318 11.0078 17.1846C11.2337 17.3208 11.589 17.4999 11.999 17.5L12.1504 17.4922C12.4959 17.456 12.7925 17.3037 12.9902 17.1846C13.2435 17.0319 13.4952 16.8318 13.7305 16.624C14.2035 16.2061 14.7045 15.6677 15.1494 15.1553C15.5985 14.638 16.0114 14.1235 16.3105 13.7402C16.4604 13.5482 16.7192 13.206 16.8047 13.0928C17.1319 12.6481 17.0364 12.0218 16.5918 11.6943C16.1471 11.3674 15.5207 11.4628 15.1934 11.9072C15.1133 12.0132 14.8768 12.3273 14.7344 12.5098C14.4483 12.8764 14.0585 13.3623 13.6396 13.8447C13.4262 14.0906 13.209 14.3294 12.999 14.5488V7.5C12.999 6.94772 12.5513 6.5 11.999 6.5Z"
                  fill="#141B34"
                />
              </svg>
              <span>agent-install</span>
            </div>
            <div className="[letter-spacing:0em] [white-space-collapse:preserve] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[17px]/[25px] text-[#707070]">
              Install agent skills and MCPs with one API.
            </div>
          </div>

          <div className="flex flex-col gap-2.75" style={{ marginTop: "23px" }}>
            <div
              onClick={handleSelectCommand}
              className="[font-synthesis:none] flex w-full h-22.25 flex-col rounded-[14px] pt-2.5 pr-3.5 pb-3.5 pl-3.75 gap-5 [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] antialiased cursor-text"
              style={{
                backgroundImage:
                  "linear-gradient(in oklab 180deg, oklab(100% 0 0) 45.83%, oklab(97.8% 0 0) 46.26%)",
              }}
            >
              <div className="flex items-start gap-3.5">
                <button
                  type="button"
                  className="flex flex-col gap-0.5 cursor-pointer text-left"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveTab("cli");
                  }}
                >
                  <div
                    className={`left-0 top-0 [white-space-collapse:preserve] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[16px]/5.75 transition-colors duration-200 ${activeTab === "cli" ? "text-[#414141]" : "text-[#A0A0A0]"}`}
                  >
                    cli
                  </div>
                </button>
                <button
                  type="button"
                  className="cursor-pointer text-left"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveTab("library");
                  }}
                >
                  <div
                    className={`left-0 top-0 [white-space-collapse:preserve] w-max font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium shrink-0 text-[16px]/5.75 transition-colors duration-200 ${activeTab === "library" ? "text-[#414141]" : "text-[#A0A0A0]"}`}
                  >
                    library
                  </div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.75 min-w-0">
                  <div className="left-0 top-0 [white-space-collapse:preserve] w-max text-[#696969] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium shrink-0 text-[16px]/5.75">
                    $
                  </div>
                  <div
                    ref={commandRef}
                    className="left-0 top-0 [white-space-collapse:preserve] min-w-0 text-[#414141] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[16px]/5.75 truncate"
                  >
                    {commandText}
                  </div>
                </div>
                <CopyButton
                  getValue={() => commandText}
                  label="Copy command"
                  onClick={(event) => event.stopPropagation()}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0">
          <div className="[font-synthesis:none] flex w-full min-w-0 h-fit flex-col gap-4.25 antialiased mt-14">
            <div className="mb-0 left-0 top-0 w-full min-w-0 [white-space-collapse:preserve] relative text-[#3F3F3F] font-['OpenRunde-Semibold','Open_Runde',system-ui,sans-serif] font-semibold text-[18px]/5.75">
              Getting started
            </div>
            <div className="[font-synthesis:none] flex w-full min-w-0 flex-col items-stretch gap-2.5 antialiased p-0">
              <div className="flex w-full min-w-0 items-start gap-1.5">
                <div className="h-6.75 text-[color(display-p3_0.722_0.722_0.722)] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium shrink-0 text-[16px]/6.75">
                  •
                </div>
                <div className="min-w-0 flex-1 text-[#5a5a5a] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[16px]/6.75">
                  Install skills, MCP servers, and AGENTS.md guidance into Claude Code, Cursor,
                  Codex, OpenCode, and{" "}
                  <a
                    href="https://github.com/millionco/agent-install#supported-agents"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer text-[color(display-p3_0.1632_0.5398_0.9268)] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium underline decoration-[color(display-p3_0.669_0.821_1)] decoration-2 underline-offset-[5px] text-[16px]/6.75 transition-[text-decoration-color] duration-200 ease-out hover:decoration-[color(display-p3_0.48_0.66_0.92)]"
                  >
                    40+ other agents
                  </a>
                </div>
              </div>
              <div className="flex w-full min-w-0 items-start gap-1.5">
                <div className="h-6.75 text-[color(display-p3_0.722_0.722_0.722)] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium shrink-0 text-[16px]/6.75">
                  •
                </div>
                <div className="min-w-0 flex-1 text-[#5a5a5a] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[16px]/6.75">
                  One CLI and one Node API that write to each agent&apos;s native config
                  (JSON/JSONC/YAML/TOML, skills directories, AGENTS.md variants)
                </div>
              </div>
              <div className="flex w-full min-w-0 items-start gap-1.5">
                <div className="h-6.75 text-[color(display-p3_0.722_0.722_0.722)] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium shrink-0 text-[16px]/6.75">
                  •
                </div>
                <div className="min-w-0 flex-1 text-[#5a5a5a] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[16px]/6.75">
                  Skills install from local paths, GitHub, GitLab, SSH URLs, or any git remote
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-112.75 min-w-0 px-4 sm:px-0 pb-16">
          <a
            href="https://github.com/millionco/agent-install"
            target="_blank"
            rel="noopener noreferrer"
            className="group [font-synthesis:none] items-center flex justify-between mt-[20px] w-fit rounded-full overflow-clip gap-0.5 pl-[14px] pr-1.75 py-2 bg-white [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] antialiased transition-shadow hover:[box-shadow:#00000014_0px_0px_0px_1px,#00000014_0px_1px_2px_-1px,#0000000F_0px_2px_4px]"
          >
            <div className="items-center flex gap-1.25">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  flexShrink: "0",
                  verticalAlign: "middle",
                  width: "15px",
                  height: "15px",
                  overflow: "clip",
                }}
              >
                <defs>
                  <clipPath id="_starclip">
                    <rect width="12" height="12" fill="#fff" />
                  </clipPath>
                </defs>
                <g clipPath="url(#_starclip)">
                  <path
                    className="fill-[#C0C0C0] transition-colors group-hover:fill-[#FFC200]"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.884 1.195C6.513 0.468 5.474 0.468 5.103 1.195L3.94 3.474L1.414 3.875C0.608 4.004 0.287 4.992 0.864 5.57L2.671 7.38L2.273 9.906C2.145 10.713 2.986 11.323 3.714 10.953L5.994 9.793L8.273 10.953C9.001 11.323 9.842 10.713 9.715 9.906L9.316 7.38L11.124 5.57C11.701 4.992 11.379 4.004 10.573 3.875L8.047 3.474L6.884 1.195Z"
                  />
                </g>
              </svg>
              <div className="shrink-0 [letter-spacing:-0.14px] w-max text-[#323232] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[15px]/4.5">
                GitHub
              </div>
            </div>
            {starCount && (
              <div className="flex flex-col items-start gap-0 px-2 py-0.75 rounded-full">
                <div className="items-center flex gap-1.25">
                  <div className="shrink-0 [letter-spacing:-0.14px] w-max text-[#323232] font-medium text-sm/4.5 font-mono-override">
                    {starCount}
                  </div>
                </div>
              </div>
            )}
          </a>

          <div
            className="left-0 top-0 w-full min-w-0 [white-space-collapse:preserve] relative text-[#3F3F3F] font-['OpenRunde-Semibold','Open_Runde',system-ui,sans-serif] font-semibold text-[18px]/5.75 mt-14"
            style={{ marginBottom: "10px" }}
          >
            Pick your agent
          </div>
          <div className="[letter-spacing:0em] max-w-102 [white-space-collapse:preserve] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[16px]/6.75 text-[#707070] mt-1.5">
            One install command, every coding agent. Toggle the agent below to see how agent-install
            writes the MCP server into its native config.
          </div>
          <div
            className="[font-synthesis:none] flex w-full flex-col rounded-[14px] [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] antialiased cursor-text"
            style={{ marginTop: "23px" }}
          >
            <div className="flex items-center justify-between bg-white rounded-t-[14px] pt-2.5 pr-3.5 pb-2.5 pl-3.75">
              <div className="flex items-center gap-1.5">
                <div className="font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[15.5px]/5.75 text-[#6e6e6e]">
                  Agent:
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="cursor-pointer flex items-center gap-1.5 outline-none">
                    <div className="font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[15.5px]/5.75 text-[#414141]">
                      {AGENTS[activeAgent].name}
                    </div>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.5 4L5 6.5L7.5 4"
                        stroke="#696969"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-64 w-56 scrollbar-visible font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif]">
                    {AGENTS.map((agent, index) => (
                      <DropdownMenuItem
                        key={agent.name}
                        className={`cursor-pointer font-medium text-[15px]/5.75 ${activeAgent === index ? "text-[#1a1a1a] bg-accent" : "text-[#696969]"}`}
                        onClick={() => setActiveAgent(index)}
                      >
                        {agent.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CopyButton
                getValue={() => buildAgentCommand(AGENTS[activeAgent].flag)}
                label="Copy configuration"
              />
            </div>
            <div className="flex items-start gap-2.75 min-w-0 pr-3.5 pb-3 pl-3.75 pt-0 rounded-b-[14px] bg-white overflow-x-auto scrollbar-none">
              <div className="[white-space-collapse:preserve] w-max text-[#696969] font-mono-override font-medium shrink-0 text-[15.5px]/5.75">
                $
              </div>
              {agentHighlights[AGENTS[activeAgent].flag] && (
                <div
                  className="shiki-block min-w-0 font-mono-override font-medium text-[15.5px]/5.75"
                  dangerouslySetInnerHTML={{
                    __html: agentHighlights[AGENTS[activeAgent].flag],
                  }}
                />
              )}
              {!agentHighlights[AGENTS[activeAgent].flag] && (
                <div className="min-w-0 font-mono-override font-medium text-[15.5px]/5.75 text-[#414141] whitespace-pre">
                  {buildAgentCommand(AGENTS[activeAgent].flag)}
                </div>
              )}
            </div>
          </div>

          <div
            className="left-0 top-0 w-full min-w-0 [white-space-collapse:preserve] relative text-[#3F3F3F] font-['OpenRunde-Semibold','Open_Runde',system-ui,sans-serif] font-semibold text-[18px]/5.75 mt-14"
            style={{ marginBottom: "10px" }}
          >
            Library API
          </div>
          <div className="[letter-spacing:0em] max-w-102 [white-space-collapse:preserve] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[16px]/6.75 text-[#707070] mt-1.5">
            Three namespaces (<code className="font-mono-override">skill</code>,{" "}
            <code className="font-mono-override">mcp</code>,{" "}
            <code className="font-mono-override">agentsMd</code>) with verbs that mirror the CLI.
          </div>
          <div
            className="[font-synthesis:none] flex w-full flex-col rounded-[14px] [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] antialiased cursor-text bg-white"
            style={{ marginTop: "23px" }}
          >
            <div className="flex items-center justify-between rounded-t-[14px] pt-2.5 pr-3.5 pb-2.5 pl-3.75">
              <div className="font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[15.5px]/5.75 text-[#6e6e6e]">
                TypeScript
              </div>
              <CopyButton getValue={() => LIBRARY_EXAMPLE} label="Copy library example" />
            </div>
            <div className="rounded-b-[14px] pr-3.5 pb-3 pl-3.75 pt-0">
              {libraryHighlight && (
                <div
                  className="shiki-block wrap font-mono-override font-medium text-[14px]/5.5"
                  dangerouslySetInnerHTML={{ __html: libraryHighlight }}
                />
              )}
              {!libraryHighlight && (
                <pre className="font-mono-override font-medium text-[14px]/5.5 text-[#414141] whitespace-pre-wrap break-words">
                  {LIBRARY_EXAMPLE}
                </pre>
              )}
            </div>
          </div>

          <div className="flex flex-col w-full max-w-107.25 mt-14">
            <div className="[letter-spacing:0em] font-['OpenRunde-Semibold','Open_Runde',system-ui,sans-serif] font-semibold text-[18px]/5.75 text-[color(display-p3_0.248_0.248_0.248)] mb-2.75">
              FAQ
            </div>
            <div className="h-[0.5px] self-stretch shrink-0 bg-[#DDDDDD] mb-2.75" />
            {[
              {
                question: "What is agent-install?",
                answer:
                  "A Node API and CLI for installing the three things every AI coding agent consumes: SKILL.md files, MCP servers, and AGENTS.md guidance. It writes to each agent's native config so you don't have to learn ten different formats.",
              },
              {
                question: "Why not just use each agent's own CLI?",
                answer:
                  "Every agent has its own format and install command. agent-install gives you a single API (skill.add, mcp.add, agentsMd.setSection) and a single CLI (agent-install skill add ...) that targets all of them. Build a tool once, ship it to every agent.",
              },
              {
                question: "Where can I install skills from?",
                answer:
                  "Local paths, GitHub repos (full URLs, owner/repo shorthand, with subpaths and branch refs), GitLab repos, SSH URLs (deploy keys for private repos), or any git remote. Direct SKILL.md URLs work too.",
              },
              {
                question: "Which agents are supported?",
                answer:
                  "Claude Code, Cursor, Codex, OpenCode, Gemini CLI, GitHub Copilot, Goose, Roo, Cline, Kilo, Claude Desktop, VS Code, Zed, Antigravity, MCPorter, Aider, and more. The supported set differs slightly by surface (skills vs MCP vs AGENTS.md).",
              },
              {
                question: "Is the API stable?",
                answer:
                  "Pre-1.0. The short verbs (skill.add, mcp.add, agentsMd.setSection) and the long-form aliases (installSkillsFromSource, installMcpServer, upsertAgentsMdSection) will both stick around. Internal helpers may change.",
              },
            ].map((faq, index) => (
              <div key={index} className="group/faq pb-2.75">
                <div
                  className="flex justify-between items-start transition-colors group-hover/faq:text-[#1E1E1E] pt-2.75 cursor-pointer"
                  onClick={() =>
                    setOpenFaqs((previous) => {
                      const next = new Set(previous);
                      if (next.has(index)) {
                        next.delete(index);
                      } else {
                        next.add(index);
                      }
                      return next;
                    })
                  }
                >
                  <div
                    className={`[letter-spacing:0em] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[15px]/5.75 transition-colors group-hover/faq:text-[#1E1E1E] ${openFaqs.has(index) ? "text-[#1E1E1E]" : "text-[#5A5A5A]"}`}
                  >
                    {faq.question}
                  </div>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: "20px", height: "auto", flexShrink: "0" }}
                    className={`group-hover/faq:text-[#1E1E1E] transition-all duration-200 ${openFaqs.has(index) ? "text-[#1E1E1E] rotate-45" : "text-[#5A5A5A]"}`}
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M6.5 3C6.5 2.724 6.276 2.5 6 2.5C5.724 2.5 5.5 2.724 5.5 3V5.5H3C2.724 5.5 2.5 5.724 2.5 6C2.5 6.276 2.724 6.5 3 6.5H5.5V9C5.5 9.276 5.724 9.5 6 9.5C6.276 9.5 6.5 9.276 6.5 9V6.5H9C9.276 6.5 9.5 6.276 9.5 6C9.5 5.724 9.276 5.5 9 5.5H6.5V3Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-200 ${openFaqs.has(index) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <div className="[letter-spacing:0em] font-['OpenRunde-Medium','Open_Runde',system-ui,sans-serif] font-medium text-[15px]/5.5 text-[#858585] whitespace-pre-line mt-1.5">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
