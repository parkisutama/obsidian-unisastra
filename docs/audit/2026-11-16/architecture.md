# Security audit architecture

Source: `704fc3a16455d2c16c153060e5901deec681a688`, initially clean worktree.
The audit branch contains reports only. Profile: standard, source-only.

## Product and principals

Unisastra is a TypeScript Obsidian plugin for local Markdown drafting and
outliner navigation. The vault owner enables settings and commands; imported
or synchronized Markdown supplies lower-trust headings, lists, links and block
IDs. Clipboard text is read only through the optional smart-link action.
Settings and local deployment configuration belong to the local account;
control of these files alone is not automatically privilege escalation.
PR authors influence verification code; main-branch changes enter release
automation. Installed plugins already have host authority and are not isolated
tenants of this plugin.

## Source paths and controls

- `src/main.ts` and `src/lib.ts`: plugin composition, settings, workspace events.
- `src/components/outline-view.ts`: Markdown titles enter host MarkdownRenderer.
- `src/components/callout-style-editor.ts`: constrained callout preview;
  custom labels use text APIs.
- `src/gfm-anchor/`: link parsing, metadata-cache resolution and TFile navigation.
- `src/capabilities/features/callouts/`: ID, hex-color and Lucide-icon validation;
  generated CSS uses a style node's textContent; CSSOM discovery has limits.
- `src/capabilities/features/toolbar/`: shared transaction policy and clipboard
  action revalidation; commands and UI use the same executor.
- `src/cm6/outliner/`: editing, opt-in block-ID insertion and fold restoration.
- `src/settings-writer.ts`: cloned snapshots and serialized persistence.
- `scripts/lib/`: build artifacts, test-vault setup and configured deployment.
  Deployment checks manifest identity, fixed filenames and an existing parent.
- `.github/workflows/`: read-permission PR verification; separate release,
  build and publication jobs; pinned actions and frozen lockfile installs.

## Execution and deployment visibility

Node 24+, pinned pnpm, esbuild, Sass and Vitest are selected by local source.
Build writes dist; tests can write caches and OS temporary files. Dev/deploy
can write a configured operational vault and are prohibited in this audit.
Vitest uses a mocked Obsidian API. Native renderer sanitization, other plugin
post-processors, Electron privileges, filesystem ACLs, GitHub branch rules,
token scopes and actual released assets are not established by this source.

The required OS-enforced empty environment, read-only target/toolchain,
scratch-only writes, network isolation and resource limits are not established.
No target code, tests, builds or browser fixtures will execute. No scratch
artifacts will be promoted. Skill validators are trusted audit tooling, but
their Windows no-follow input protection may prevent validation; a failure
must leave the run incomplete rather than imply a passing gate.

## Coverage and companions

The ledger assigns ten source units across rendering, navigation, settings,
editor mutation, local files, CI, release, dependencies and cross-cutting
native lifecycle, including the separately reviewed CSSOM discovery path. Browser, local-desktop and supply-chain companions apply to
these actual boundaries. HTTP authentication, cloud IAM, multi-tenant data,
native memory safety and LLM tool execution have no target implementation.
No compatible prior JSON ledger/findings exists in this repository. The
archived May 2026 checklist is historical community-readiness context for a
different plugin identity/version; its severities are not carried forward.
README comparables (Typewriter Mode, Logseq-style outliner, Obsidian Zoom)
calibrate product scope only and provide no security guarantee.

Secrets, environment-file values, operational vaults, full Git history,
dependency source internals, live services and hosted settings are excluded.
Dependency manifest/lockfile and build selection are in scope; a fresh advisory
database scan is not performed. A source-only covered unit means its recorded
invariants were traced, not that every input or host behavior is safe.
