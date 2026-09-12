import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/obsidian-md-writer/",
  description:
    "High-precision drafting for Obsidian with typewriter scrolling, whitespace visualization, and outliner focus.",
  lang: "en-US",
  title: "MD Writer",
  themeConfig: {
    nav: [
      { link: "/", text: "Home" },
      { link: "/for-users/install-md-writer", text: "Users" },
      { link: "/for-developers/setup-local-development", text: "Developers" },
      { link: "/reference/release-gates", text: "Reference" },
    ],
    sidebar: [
      {
        text: "Active specifications",
        items: [
          {
            link: "/specs/floaty-toolbar/spec",
            text: "Floaty Toolbar: accepted spec",
          },
          {
            link: "/specs/floaty-toolbar/plan",
            text: "Floaty Toolbar: accepted plan",
          },
          {
            link: "/specs/floaty-toolbar/tasks",
            text: "Floaty Toolbar: draft tasks",
          },
          {
            link: "/reference/decisions/ADR-002-floaty-toolbar-and-callout-management",
            text: "ADR-002: toolbar and callouts (Accepted)",
          },
        ],
      },
      {
        text: "AI development context",
        items: [
          {
            link: "/for-developers/ai-assisted-development",
            text: "AI Assisted Development",
          },
          { link: "/current-state", text: "Current state" },
          { link: "/development-status", text: "Development status" },
          {
            link: "/reference/code-architecture-baseline",
            text: "Architecture baseline",
          },
          {
            link: "/reference/decisions/ADR-001-ai-development-context-and-gates",
            text: "ADR-001: context and gates",
          },
        ],
      },
      {
        items: [
          { link: "/for-users/install-md-writer", text: "Install MD Writer" },
          {
            link: "/for-users/use-md-writer-features",
            text: "Use MD Writer features",
          },
          { link: "/for-users/troubleshooting", text: "Troubleshooting" },
        ],
        text: "Pengguna plugin",
      },
      {
        items: [
          {
            link: "/for-developers/setup-local-development",
            text: "Set up local development",
          },
          {
            link: "/for-developers/start-a-feature-or-bugfix",
            text: "Start a feature or bugfix",
          },
          {
            link: "/for-developers/run-qa-before-merge-or-release",
            text: "Run QA before merge or release",
          },
          {
            link: "/for-developers/commit-push-and-release",
            text: "Commit, push, and release",
          },
          {
            link: "/for-developers/create-a-github-release",
            text: "Create a GitHub release",
          },
          {
            link: "/for-developers/ship-a-change-from-branch-to-release",
            text: "Ship a change to release",
          },
          {
            link: "/for-developers/documentation-guidelines",
            text: "Documentation guidelines",
          },
          {
            link: "/for-developers/sdlc-for-this-plugin",
            text: "SDLC for this plugin",
          },
        ],
        text: "Developer dan maintainer",
      },
      {
        items: [
          {
            link: "/reference/branching-conventions",
            text: "Branching conventions",
          },
          { link: "/reference/release-gates", text: "Release gates" },
          {
            link: "/reference/outliner-urd-prd",
            text: "Outliner URD, PRD, and plan",
          },
          {
            link: "/reference/obsidian-plugin-audit-prompts",
            text: "Obsidian plugin audit prompts",
          },
        ],
        text: "Reference",
      },
      {
        items: [
          {
            link: "/archive/release-plan-active-document-warnings",
            text: "Active document warning cleanup",
          },
          {
            link: "/archive/obsidian-plugin-audit-report-2026-05-14",
            text: "Audit report, 2026-05-14",
          },
        ],
        text: "Archive",
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/parkisutama/obsidian-md-writer",
      },
    ],
  },
});
