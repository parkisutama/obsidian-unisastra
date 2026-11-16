# Obsidian plugin audit report: MD Writer

## Executive summary

- Final decision: Not ready
- Blockers: 1
- High severity: 1
- Medium severity: 4
- Low severity: 1
- Main release risk: `manifest.json` declares mobile support while the plugin uses Electron fullscreen APIs.

## Audit metadata

| Field | Value |
|---|---|
| Plugin | MD Writer |
| Plugin ID | `md-writer` |
| Version | `1.0.0` |
| Commit | `f3ba0d5` |
| Branch | `main` |
| Target release | Initial community submission or update release |
| Audited date | 2026-05-14 |
| Package manager | `pnpm@10.32.1` |
| Build command | `pnpm run build` |
| Check command | `pnpm run check` |
| Test command | `pnpm run test` |

## Gate results

| Gate | Result | Reason |
|---|---|---|
| Policy gate | Pass | Searches found no ads, telemetry SDKs, secrets, remote code execution, or self-update download of plugin assets. Network use is limited to GitHub release notes and is disclosed in README. |
| Security gate | Pass | No `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, `new Function`, script injection, or beacon APIs were found in source. |
| Manifest gate | Fail | `manifest.json` sets `isDesktopOnly` to `false`, but source uses `window.electron.remote` for fullscreen writing focus. |
| Build gate | Fail | Build, typecheck, tests, Biome, Stylelint, Obsidian ESLint, and artifact verification pass, but `pnpm run lint:md` fails on the audit prompt document. |
| Documentation gate | Fail | README lacks usage, settings reference, platform support, known limitations, troubleshooting, development commands, beta/install details, and fuller data handling notes. |
| Release gate | Unknown | Local `dist/main.js`, `dist/manifest.json`, and `dist/styles.css` verify for `1.0.0`, and tag `1.0.0` exists locally. GitHub release existence and uploaded assets were not verified. |

## Findings

| ID | Area | Severity | Status | Evidence | Risk | Recommended fix | Verification |
|---|---|---:|---|---|---|---|---|
| OBS-AUD-001 | Manifest and mobile compatibility | Blocker | Fail | `manifest.json:10` has `"isDesktopOnly": false`; `src/capabilities/commands/writing-focus/writing-focus.ts:54` and `:77` call `window.electron.remote.getCurrentWindow()`. The audit checklist requires `isDesktopOnly` to reflect Node.js or Electron API use. | Community review rejection or unsupported mobile behavior if platform assumptions change. | Choose one path: set `isDesktopOnly` to `true`, or remove direct Electron API usage from the mobile-supported build path and document which Writing Focus options are desktop-only. | `rg "window\\.electron|from ['\\\"]electron|require\\(['\\\"]electron" src manifest.json`; manually test on Android and iOS if keeping `isDesktopOnly: false`. |
| OBS-AUD-002 | Build and lint gate | High | Fail | `pnpm run lint:md` fails on `docs/reference/obsidian-plugin-audit-prompts.md:487`, `:618`, `:626`, `:629`, `:630`, `:705`, `:712`, `:713`, `:714`, and `:914`. | `pnpm run check` and CI fail because `check:ci` includes `lint:md`. | Run `pnpm run fix:md` or manually fix the Markdown lint issues in the audit prompt document. | `pnpm run lint:md`; then `pnpm run check`. |
| OBS-AUD-003 | README completeness | Medium | Needs work | README covers purpose/features at `README.md:1-23`, manual install at `README.md:25-31`, privacy/network at `README.md:62-66`, and license at `README.md:68-70`, but does not include usage, settings reference, platform support, known limitations, troubleshooting, development commands, beta install, or support/reporting instructions. | Users and Obsidian reviewers lack enough information to install, test, configure, and evaluate supported platforms. | Add sections for usage, settings, platform support, limitations, troubleshooting, development, beta testing with BRAT/manual install, support, and data handling. | Review README against the checklist in `docs/reference/obsidian-plugin-audit-prompts.md:728-740`. |
| OBS-AUD-004 | Obsidian API and popout compatibility | Medium | Needs work | `pnpm run lint:obsidian` exits 0 but reports 15 warnings: `src/capabilities/commands/writing-focus/writing-focus.ts:113`, `:114`, `:121`, `:133`, `:143`, `:154`, `:156`, `:159`, `:175`, `:176`; `src/capabilities/features/hemingway-mode/hemingway-mode.ts:88`, `:94`; `src/cm6/plugin.ts:313`, `:327`, `:333`. | Direct `document` access can target the wrong document in Obsidian popout windows. | Use the active editor/window document where possible, or centralize document selection through Obsidian's active window helpers. | `pnpm run lint:obsidian`; manually test writing focus, Hemingway mode, and current-line visuals in a popout window. |
| OBS-AUD-005 | Resource lifecycle | Medium | Needs work | `src/capabilities/commands/writing-focus/writing-focus.ts:60-64` registers `currentWindow.on("leave-full-screen", onLeaveFullScreen)` and only removes it when the event fires. | If the plugin unloads or focus mode exits before the OS fullscreen leave event, the listener can remain attached to the Electron window. | Store the fullscreen listener and remove it on focus-mode disable and plugin unload. | Toggle Writing Focus fullscreen repeatedly and unload the plugin; inspect listener behavior or add a focused unit/manual test. |
| OBS-AUD-006 | Workspace lifecycle | Medium | Needs work | `src/capabilities/features/outliner/outliner-sidebar.ts:17-20` calls `workspace.detachLeavesOfType(OUTLINE_VIEW_TYPE)` in feature disable, and `TypewriterModeLib.unload()` disables all features at `src/lib.ts:164-169`. | Plugin unload or update can close the user's outline leaf instead of letting Obsidian restore layout naturally. | Do not detach leaves on global plugin unload; reserve detachment for explicit user disable, or persist user intent separately. | Enable sidebar outline, reload Obsidian/plugin, and verify whether the outline leaf remains as expected. |
| OBS-AUD-007 | README style | Low | Needs work | README feature labels use title case, for example `README.md:7`, `:9`, `:11`, `:13`, `:15`, `:17`, `:19`, `:21`, `:23`. The audit style checklist prefers sentence case for headings and user-facing labels. | Minor style inconsistency with Obsidian documentation conventions. | Use sentence case labels, for example `Typewriter scrolling`, `Show whitespace`, and `Writing focus`. | Manual documentation review. |

## Required fixes before release

1. Resolve OBS-AUD-001 by aligning Electron fullscreen usage with manifest mobile support.
2. Resolve OBS-AUD-002 so `pnpm run check` and CI can pass.

## Recommended improvements

1. Expand README content for usage, settings, platform support, limitations, troubleshooting, development, beta testing, and data handling.
2. Address Obsidian ESLint popout-window warnings.
3. Clean up fullscreen listener lifecycle in Writing Focus.
4. Avoid detaching outline leaves during plugin unload or update unless the user explicitly disables the sidebar feature.
5. Normalize README feature labels to sentence case.

## Positive observations

- Root `README.md`, `LICENSE`, `manifest.json`, `package.json`, and `pnpm-lock.yaml` are present and tracked.
- Manifest has required fields, stable kebab-case ID, SemVer version, valid author URL, repository URL, and no `obsidian` substring in the ID.
- Release workflow attaches individual `dist/main.js`, `dist/manifest.json`, and `dist/styles.css` assets.
- Automated tests exist for command registration, settings, release validation, and typewriter offset logic.
- Local `pnpm run build`, `pnpm run typecheck`, `pnpm run test`, `pnpm run lint`, `pnpm run lint:styles`, `pnpm run lint:obsidian`, and `pnpm run verify:artifacts` completed successfully.
- README discloses GitHub release-note network use and states that vault content and note text are not sent over the network.

## Unknowns

- Clean install from an empty clone was not run; dependencies were already present locally.
- GitHub release existence and uploaded assets for tag `1.0.0` were not verified because this audit did not use network access.
- Mobile behavior was not manually tested on Android or iOS.
- Dependency license compatibility was not generated as a formal license report.

## Commands run

```bash
rg --files docs src tests .github
rg "innerHTML|outerHTML|insertAdjacentHTML|eval\(|new Function|document\.write|createElement\(['\"]script|fetch\(|requestUrl\(|XMLHttpRequest|WebSocket|sendBeacon|analytics|telemetry|tracking|metrics|posthog|segment|amplitude|sentry|auto.?update|self.?update|download.*main\.js|remote.*script|api[_-]?key|token|secret|password|bearer|authorization" .
rg "from ['\"]fs|from ['\"]path|from ['\"]os|from ['\"]crypto|require\(['\"]fs|require\(['\"]electron|process\.|Buffer\b|__dirname|__filename|\(\?<=|\(\?<!" src package.json scripts
rg "window\.app|\bapp\.|registerEvent|registerDomEvent|registerInterval|addCommand|onunload|detach|setInterval|addEventListener|activeLeaf|activeEditor|getActiveViewOfType|getActiveLeavesOfType|registerView|vault\.modify|vault\.process|processFrontMatter|vault\.adapter|getFiles\(\).*find|getFileByPath|getAbstractFileByPath|normalizePath" src main.ts
pnpm run build
pnpm run typecheck
pnpm run test
pnpm run lint
pnpm run lint:styles
pnpm run lint:obsidian
pnpm run lint:md
pnpm run verify:artifacts
git tag --points-at HEAD
git tag --list "1.0.0"
git ls-files README.md LICENSE manifest.json package.json pnpm-lock.yaml .github/workflows/check.yml .github/workflows/release.yml docs/reference/obsidian-plugin-audit-prompts.md
```
