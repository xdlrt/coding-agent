import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@rspress/core";
import mermaid from "rspress-plugin-mermaid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "docs/claude-code-learning",
  outDir: "doc_build/claude-code-learning",
  globalStyles: path.join(
    __dirname,
    "docs/claude-code-learning/styles/geek.css"
  ),
  title: "Claude Code Learning",
  description:
    "Claude Code architecture notes and module-level comparisons for coding-agent.",
  lang: "zh",
  markdown: {
    showLineNumbers: true,
  },
  plugins: [
    mermaid({
      mermaidConfig: {
        theme: "neutral",
      },
    }),
  ],
  themeConfig: {
    search: true,
    lastUpdated: true,
    nav: [
      { text: "总览", link: "/" },
      { text: "架构笔记", link: "/architecture/" },
      { text: "模块笔记", link: "/modules/" },
      { text: "覆盖矩阵", link: "/module-coverage" },
    ],
    sidebar: {
      "/architecture/": [
        {
          text: "Architecture",
          link: "/architecture/",
          collapsible: true,
          items: [
            { text: "Agentic Loop 与停止条件", link: "/architecture/agentic-loop" },
            { text: "Tool Use 协议与执行链路", link: "/architecture/tool-use-protocol" },
            { text: "Context / Memory / Compact", link: "/architecture/context-compact" },
            { text: "Permission / Sandbox / Safety", link: "/architecture/permission-safety" },
            { text: "Skill 系统与能力扩展", link: "/architecture/skill-system" },
            { text: "MCP / LSP / API 服务层", link: "/architecture/service-integrations" },
            { text: "插件系统与扩展治理", link: "/architecture/plugin-system" },
            { text: "IDE / Remote / Server Bridge", link: "/architecture/bridge-remote-server" },
            { text: "状态、记忆与配置治理", link: "/architecture/state-memory-config" },
            { text: "CLI / TUI / Commands / Session", link: "/architecture/cli-tui-session" },
            { text: "输入输出体验", link: "/architecture/input-output-experience" },
            { text: "Git / GitHub 工作流", link: "/architecture/git-github-workflow" },
            { text: "Observability / Eval / Trace", link: "/architecture/observability-evals" },
            { text: "Sub-agent / Task / Coordinator", link: "/architecture/sub-agent-orchestration" },
          ],
        },
      ],
      "/modules/": [
        {
          text: "Modules",
          link: "/modules/",
          collapsible: true,
          items: [
            { text: "Query / Agent Loop", link: "/modules/query-agent-loop" },
            { text: "Tool 类型与注册", link: "/modules/tool-types-registry" },
            { text: "文件与命令工具", link: "/modules/file-command-tools" },
            { text: "Context", link: "/modules/context" },
            { text: "Permission / Harness", link: "/modules/permission-harness" },
            { text: "SkillTool / Skills", link: "/modules/skill-tool-skills" },
            { text: "MCP / LSP / API / OAuth", link: "/modules/mcp-lsp-api-oauth" },
            { text: "Plugin System", link: "/modules/plugin-system" },
            { text: "Bridge / Remote / Server", link: "/modules/bridge-remote-server" },
            { text: "State / Memory / Config", link: "/modules/state-memory-config" },
            { text: "Task / AgentTool", link: "/modules/task-agent-tool" },
            { text: "CLI / Commands / TUI", link: "/modules/cli-commands-tui" },
            { text: "Input / Output UX", link: "/modules/input-output-ux" },
            { text: "Git / GitHub Workflow", link: "/modules/git-github-workflow" },
            { text: "Hooks / Observability", link: "/modules/hooks-observability" },
          ],
        },
      ],
      "/": [
        {
          text: "Claude Code Learning",
          items: [
            { text: "学习总览", link: "/" },
            { text: "学习说明", link: "/README" },
            { text: "模块覆盖矩阵", link: "/module-coverage" },
            { text: "分析模板", link: "/templates/module-analysis" },
          ],
        },
      ],
    },
  },
});
