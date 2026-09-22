# Obsidian plugin audit document and LLM audit prompts

## 1. Purpose

Use this document to audit an Obsidian community plugin before beta testing, first submission, or release updates. The audit is based on:

1. Obsidian Developer policies.
2. Obsidian plugin submission requirements.
3. Obsidian plugin release and beta-testing guidance.
4. Obsidian Help style guide.
5. Google developer documentation style guide.
6. Microsoft Writing Style Guide.

The output should answer one practical question:

> Is this plugin safe, policy-compliant, maintainable, releasable, and documented clearly enough for Obsidian users?

---

## 2. Audit metadata

| Field | Value |
|---|---|
| Plugin name |  |
| Repository URL |  |
| Plugin ID |  |
| Version audited |  |
| Branch / commit |  |
| Auditor |  |
| Audit date |  |
| Target release type | Beta / Initial community submission / Update release |
| Desktop support | Yes / No |
| Mobile support | Yes / No / Not applicable |
| Uses network | No / Yes, disclosed / Yes, not disclosed |
| Uses Node.js or Electron APIs | No / Yes |
| Has `styles.css` | No / Yes |
| Has tests | No / Yes |
| Has CI | No / Yes |

---

## 3. Status, severity, and evidence standard

### 3.1 Status values

| Status | Meaning |
|---|---|
| Pass | Meets the requirement with evidence. |
| Fail | Violates the requirement or blocks release. |
| Needs work | Partially meets the requirement but needs changes. |
| Not applicable | Requirement does not apply to this plugin. |
| Unknown | Could not verify from the available repository evidence. |

### 3.2 Severity values

| Severity | Meaning | Typical action |
|---|---|---|
| Blocker | Violates Obsidian policy, security expectations, or release requirements. | Fix before beta or submission. |
| High | Likely to cause review rejection, data loss, major UX issues, or broken installation. | Fix before release. |
| Medium | Maintainability, clarity, or quality issue that should be addressed. | Fix before or shortly after release. |
| Low | Minor polish issue. | Track as cleanup. |

### 3.3 Evidence rules

Every finding should include:

- File path.
- Line number or approximate location.
- Requirement violated or satisfied.
- Impact.
- Recommended fix.
- Verification command or manual test.

Use this finding format:

| ID | Area | Severity | Status | Evidence | Risk | Recommended fix | Verification |
|---|---|---:|---|---|---|---|---|
| OBS-AUD-001 |  |  |  |  |  |  |  |

---

## 4. Audit source hierarchy

Use this hierarchy when guidance conflicts:

1. Obsidian Developer policies.
2. Obsidian plugin submission requirements.
3. Obsidian plugin guidelines and release guidance.
4. Obsidian Help style guide.
5. Google developer documentation style guide.
6. Microsoft Writing Style Guide.
7. Project-specific conventions, only when they do not conflict with the above.

---

## 5. Repository inventory checklist

| Check | Status | Evidence | Notes |
|---|---|---|---|
| Repository is public or reviewable. |  |  | Required for Obsidian community review. |
| Root has `README.md`. |  |  | Must explain purpose and usage. |
| Root has `LICENSE`. |  |  | Must clearly indicate plugin license. |
| Root has `manifest.json`. |  |  | Required for plugin metadata. |
| Build produces `main.js`. |  |  | Required release asset. |
| Build produces `styles.css` only if the plugin needs CSS. |  |  | Optional release asset. |
| Source files are organized when there is more than one `.ts` file. |  |  | Improves reviewability and maintainability. |
| Sample plugin placeholders are removed. |  |  | Remove `MyPlugin`, `SampleSettingTab`, sample commands, and unused demo code. |
| Dependency lockfile is present. |  |  | Example: `pnpm-lock.yaml`, `package-lock.json`, or `yarn.lock`. |
| Package manager and Node version are documented. |  |  | Helps repeatable builds. |
| Build, lint, and typecheck commands are documented. |  |  | Required for maintainability. |

---

## 6. Obsidian developer policy audit

### 6.1 Prohibited behavior

| Requirement | Status | Evidence | Severity if violated | Notes |
|---|---|---|---:|---|
| Plugin does not obfuscate code to hide its purpose. |  |  | Blocker | Minified build output is acceptable if source is reviewable; hidden intent is not. |
| Plugin does not load dynamic ads from the internet. |  |  | Blocker | Check UI, network calls, dependencies, and README. |
| Plugin does not insert static ads outside its own interface. |  |  | Blocker | Ads must not appear in Obsidian surfaces unrelated to the plugin. |
| Plugin does not include client-side telemetry. |  |  | Blocker | Search for analytics SDKs, event tracking, metrics, beacons, and hidden fetch calls. |
| Plugin does not include a self-update mechanism. |  |  | Blocker | Updates should use normal GitHub releases and Obsidian’s update flow. |
| Plugin is not malicious or deceptive. |  |  | Blocker | Review commands, file writes, external calls, and permissions. |

### 6.2 Required disclosures

| Disclosure item | Applies? | Disclosed in README? | Disclosed in settings/UI? | Severity if missing | Notes |
|---|---|---|---|---:|---|
| Payment is required for full access. |  |  |  | High | State exactly what is free and what is paid. |
| Account is required for full access. |  |  |  | High | State which account and why it is required. |
| Network use. |  |  |  | High | Explain remote services, data sent, and why network use is needed. |
| Access to files outside the vault. |  |  |  | High | Explain why outside-vault access is needed. |
| Static ads inside the plugin interface. |  |  |  | High | Keep ads inside the plugin’s own interface. |
| Server-side telemetry. |  |  |  | High | Link to a privacy policy and explain data handling. |
| Closed-source code. |  |  |  | High | Must be disclosed and may be reviewed case by case. |

### 6.3 Copyright, license, and trademark

| Requirement | Status | Evidence | Severity if violated | Notes |
|---|---|---|---:|---|
| Repository includes a clear `LICENSE` file. |  |  | Blocker | Required for community plugins. |
| README attributes copied or adapted third-party code when required. |  |  | High | Check dependencies, snippets, copied code, and UI assets. |
| Dependency licenses are compatible with the plugin license and distribution model. |  |  | High | Generate a dependency license report if possible. |
| Plugin name and README do not imply first-party Obsidian ownership. |  |  | High | Avoid confusing use of the Obsidian trademark. |
| Plugin ID does not contain `obsidian`. |  |  | Blocker | Required by manifest rules. |

---

## 7. Manifest audit

Review `manifest.json`.

| Field | Required | Audit check | Status | Evidence |
|---|---:|---|---|---|
| `id` | Yes | Unique, stable, lowercase/kebab-case preferred, does not contain `obsidian`, matches plugin folder for local development. |  |  |
| `name` | Yes | Clear display name, not misleading, not implying first-party status. |  |  |
| `version` | Yes | Semantic version format `x.y.z`. |  |  |
| `minAppVersion` | Yes | Minimum compatible Obsidian version; use latest stable if unknown. |  |  |
| `description` | Yes | 250 characters maximum, short, simple, action-oriented, ends with a period, no emoji or special characters. |  |  |
| `author` | Yes | Correct author name. |  |  |
| `authorUrl` | No | Valid URL if present. |  |  |
| `fundingUrl` | No | Only used for financial support links; removed if no donation/support page exists. |  |  |
| `isDesktopOnly` | Yes | `true` if plugin uses Node.js or Electron APIs; otherwise `false`. |  |  |

### 7.1 Manifest red flags

Search for these issues:

- `id` includes `obsidian`.
- `version` has a leading `v`, suffix, or non-SemVer format.
- `description` starts with “This is a plugin”.
- `description` exceeds 250 characters.
- `description` lacks a final period.
- `fundingUrl` points to a general website instead of a financial support service.
- `isDesktopOnly` is `false` while code imports or requires Node.js or Electron APIs.

---

## 8. Code quality and Obsidian API audit

### 8.1 General code review

| Check | Status | Evidence | Severity if violated | Notes |
|---|---|---|---:|---|
| Avoids global `app` or `window.app`; uses `this.app`. |  |  | Medium | Global app is for debugging and may be removed. |
| Avoids unnecessary console logging. |  |  | Low / Medium | Keep default console output clean except errors. |
| Uses meaningful class and type names. |  |  | Medium | Rename sample placeholders. |
| Uses `const` and `let` instead of `var`. |  |  | Low | Modern TypeScript convention. |
| Uses `async` / `await` rather than complex promise chains where practical. |  |  | Low / Medium | Improves readability and error handling. |
| Handles errors intentionally. |  |  | High | User-visible failures should be recoverable or clearly explained. |
| Avoids broad `any` types unless justified. |  |  | Medium | Keep TypeScript useful. |
| Keeps domain logic separate from UI rendering. |  |  | Medium | Improves testability. |

### 8.2 Security-sensitive DOM handling

| Check | Status | Evidence | Severity if violated | Notes |
|---|---|---|---:|---|
| Avoids `innerHTML`, `outerHTML`, and `insertAdjacentHTML` with user-controlled input. |  |  | Blocker / High | Use DOM APIs or Obsidian helpers. |
| Uses `createEl()`, `createDiv()`, `createSpan()`, or safe DOM methods. |  |  | Medium | Preferred for constructing UI. |
| Sanitizes or avoids rendering untrusted Markdown/HTML. |  |  | High | Especially important for note content, file names, settings, and remote data. |
| Does not execute remote code. |  |  | Blocker | Search for `eval`, `new Function`, dynamic script injection, and remote imports. |

Suggested searches:

```bash
rg "innerHTML|outerHTML|insertAdjacentHTML|eval\(|new Function|document\.write|script" src main.ts
rg "fetch\(|requestUrl\(|XMLHttpRequest|WebSocket|navigator\.sendBeacon" src main.ts
rg "analytics|telemetry|tracking|metrics|beacon|posthog|segment|amplitude|sentry" .
```

### 8.3 Resource lifecycle

| Check | Status | Evidence | Severity if violated | Notes |
|---|---|---|---:|---|
| Event listeners are registered through Obsidian lifecycle helpers where practical. |  |  | High | Prefer `registerEvent()`, `registerDomEvent()`, `registerInterval()`, and plugin APIs that clean up on unload. |
| Intervals and timers are cleaned up. |  |  | High | Prevent leaks after plugin unload/update. |
| Custom views do not keep unsafe plugin-level references that can leak. |  |  | Medium / High | Use workspace lookup methods when needed. |
| `onunload` does not unnecessarily detach leaves. |  |  | Medium | Let Obsidian reinitialize leaves after updates. |
| External resources are released on unload. |  |  | High | Includes listeners, workers, subscriptions, file watchers, and long-running processes. |

### 8.4 Commands

| Check | Status | Evidence | Severity if violated | Notes |
|---|---|---|---:|---|
| Command IDs do not repeat the plugin ID. |  |  | High | Obsidian prefixes command IDs automatically. |
| No default hotkeys unless strongly justified. |  |  | Medium | Avoid conflicts with user and plugin hotkeys. |
| Uses `callback` for unconditional commands. |  |  | Medium | Match command behavior. |
| Uses `checkCallback`, `editorCallback`, or `editorCheckCallback` when command availability depends on context. |  |  | Medium | Improves command palette behavior. |
| Command names use sentence case. |  |  | Low / Medium | Style consistency. |

### 8.5 Workspace and editor APIs

| Check | Status | Evidence | Severity if violated | Notes |
|---|---|---|---:|---|
| Avoids direct access to `workspace.activeLeaf`. |  |  | Medium | Prefer `getActiveViewOfType()` or `activeEditor`. |
| Uses `activeEditor` or `Editor` for active-note edits. |  |  | High | Preserves cursor, selection, and folds. |
| Reconfigures editor extensions using a stable extension array and `workspace.updateOptions()`. |  |  | Medium | Required for dynamic extension updates. |
| Custom views are registered without unsafe persistent references. |  |  | Medium | Prevent memory leaks and stale state. |

### 8.6 Vault and file operations

| Check | Status | Evidence | Severity if violated | Notes |
|---|---|---|---:|---|
| Uses `Editor` instead of `Vault.modify()` for active note edits. |  |  | High | Avoids losing editor state. |
| Uses `Vault.process()` instead of `Vault.modify()` for background edits. |  |  | High | Atomic edits reduce conflicts. |
| Uses `FileManager.processFrontMatter()` for frontmatter edits. |  |  | High | Avoid manual YAML parsing/writing. |
| Prefers Vault API over Adapter API for vault files. |  |  | Medium / High | Better caching and safer serialization. |
| Avoids iterating all files to find a path. |  |  | Medium | Prefer `getFileByPath()`, `getFolderByPath()`, or `getAbstractFileByPath()`. |
| Uses `normalizePath()` for user-defined or constructed vault paths. |  |  | High | Required for cross-platform path safety. |
| Handles file-not-found and type mismatch cases. |  |  | High | Example: distinguish `TFile`, `TFolder`, and null. |
| Does not access files outside the vault unless necessary and disclosed. |  |  | Blocker / High | Disclosure required. |

Suggested searches:

```bash
rg "vault\.modify|vault\.process|processFrontMatter|vault\.adapter|getFiles\(\).*find|getFileByPath|getAbstractFileByPath|normalizePath" src main.ts
rg "activeLeaf|activeEditor|getActiveViewOfType|registerView|getActiveLeavesOfType" src main.ts
```

### 8.7 Mobile compatibility

| Check | Status | Evidence | Severity if violated | Notes |
|---|---|---|---:|---|
| If Node.js or Electron APIs are used, `isDesktopOnly` is `true`. |  |  | Blocker | Required. |
| If `isDesktopOnly` is `false`, plugin avoids Node.js-only packages and Electron APIs. |  |  | Blocker | Check imports and bundled dependencies. |
| Regular expressions avoid unsupported lookbehind where mobile compatibility matters. |  |  | High | Test on target mobile platforms. |
| README states platform support accurately. |  |  | High | Do not imply mobile support unless tested. |
| Beta test plan includes mobile when supported. |  |  | Medium / High | Test Android and iOS where applicable. |

Suggested searches:

```bash
rg "from ['\"]fs|from ['\"]path|from ['\"]os|from ['\"]crypto|require\(['\"]fs|require\(['\"]electron|process\.|Buffer\b|__dirname|__filename" src main.ts package.json
rg "\(\?<=|\(\?<!" src main.ts
```

---

## 9. Styling and UI audit

| Check | Status | Evidence | Severity if violated | Notes |
|---|---|---|---:|---|
| Avoids hardcoded inline styles where CSS classes and variables are more appropriate. |  |  | Medium | Supports themes and snippets. |
| Uses Obsidian CSS variables where available. |  |  | Medium | Keeps plugin visually consistent. |
| Plugin CSS is scoped to plugin-specific classes. |  |  | High | Avoid global UI breakage. |
| UI text uses sentence case. |  |  | Low / Medium | Example: “Create new note”, not “Create New Note”. |
| Settings tab only uses headings when there is more than one section. |  |  | Low / Medium | Avoid redundant top-level “Settings” headings. |
| Settings headings do not include the word “settings”. |  |  | Low | Use “Advanced”, not “Advanced settings”. |
| Uses `setHeading()` for settings headings. |  |  | Low / Medium | Avoid raw heading elements for plugin settings. |
| Buttons, commands, notices, and settings labels are concise and action-oriented. |  |  | Medium | Avoid vague labels. |
| Notices are not spammy or deceptive. |  |  | High | Avoid disruptive notifications. |

Suggested searches:

```bash
rg "style\.|setAttr\(['\"]style|createEl\(['\"]h[1-6]|innerHTML|setHeading|new Setting|addCommand|new Notice" src main.ts
rg "#[a-fA-F0-9]{3,8}|rgb\(|rgba\(|color:|background:" src styles.css src main.ts
```

---

## 10. Documentation audit

### 10.1 README structure

A release-ready README should include:

1. Plugin purpose.
2. Main features.
3. Installation instructions.
4. Usage instructions with realistic examples.
5. Settings reference when settings affect behavior significantly.
6. Platform support: desktop, mobile, or desktop-only.
7. Required disclosures: network, account, payment, telemetry, outside-vault access, or closed-source components.
8. Privacy and data handling notes if any data leaves the vault.
9. Known limitations.
10. Troubleshooting.
11. Development commands.
12. License and attribution.

### 10.2 Writing style checklist

| Check | Status | Evidence | Notes |
|---|---|---|---|
| Uses clear Global English for international users. |  |  | Avoid idioms and culturally specific expressions. |
| Uses active voice and direct sentence construction. |  |  | Make the actor clear. |
| Uses second person where appropriate. |  |  | Prefer “you” over “we” in user docs. |
| Uses simple, common words over complex terminology. |  |  | Define necessary technical terms. |
| Uses American English spelling. |  |  | Example: “organize”, not “organise”. |
| Uses sentence case for headings. |  |  | Match UI case exactly when referencing UI labels. |
| Uses numbered lists for sequential steps. |  |  | One action per step where practical. |
| Uses bullet lists for non-sequential items. |  |  | Avoid tables for simple one-column lists. |
| Uses descriptive link text. |  |  | Avoid “click here”. |
| Uses bold for UI labels. |  |  | Example: Select **Settings**. |
| Uses code formatting for filenames, commands, package names, and code symbols. |  |  | Example: `manifest.json`, `pnpm run build`. |
| Uses realistic examples. |  |  | Avoid nonsense examples such as `foo` and `bar` unless context is purely synthetic. |
| Describes UI interactions with “select” when input method is generic. |  |  | Use “tap” only for mobile-specific touch instructions. |
| Uses clear keyboard shortcut notation. |  |  | Example: `Ctrl+Z` (Windows) or `Command+Z` (macOS). |
| Provides alt text for images. |  |  | Required for accessibility. |
| Optimizes images and uses appropriate formats. |  |  | Prefer `.png` or `.svg` where appropriate. |

### 10.3 Obsidian terminology checklist

| Prefer | Avoid / use only when appropriate |
|---|---|
| keyboard shortcut | hotkey, except when referring to the Obsidian Hotkey feature |
| sync / syncing | synchronise / synchronising |
| search term | search query |
| heading | header, when referring to text that introduces a section |
| maximum / minimum | max / min in prose |
| sidebar | side bar |
| perform | invoke / execute for user actions |
| note | Markdown file in the vault |
| file | non-Markdown file extensions |
| note name | note title |
| active note | current note |
| folder | directory |
| file type | file format, unless discussing the actual data format |

---

## 11. Build, CI, and test audit

| Check | Status | Evidence | Severity if violated | Notes |
|---|---|---|---:|---|
| `pnpm install` / `npm install` works from a clean clone. |  |  | High | Use the project’s package manager. |
| Build command completes. |  |  | Blocker | Example: `pnpm run build`. |
| Typecheck completes. |  |  | High | Example: `tsc --noEmit`. |
| Lint completes. |  |  | Medium / High | Include Obsidian-specific linting if configured. |
| Format check completes. |  |  | Medium | Example: Biome, Prettier, ESLint format, Stylelint. |
| Tests exist for important pure logic. |  |  | Medium | Strongly recommended even if not required. |
| Manual smoke test plan exists. |  |  | High | Required when no automated integration tests exist. |
| CI runs build, typecheck, lint, and tests. |  |  | Medium / High | Prevent broken releases. |
| Release workflow attaches required files. |  |  | High | `main.js`, `manifest.json`, optional `styles.css`. |
| Build artifacts are not stale. |  |  | Blocker | Release assets must match source and manifest version. |

### 11.1 Suggested command suite

Adapt these commands to the repository:

```bash
pnpm install --frozen-lockfile
pnpm run build
pnpm run check
pnpm run test
pnpm run lint
pnpm run typecheck
```

If the repository does not have a test runner, record this as a finding and add at least:

- Unit tests for pure parsing, transformation, and formatting logic.
- Smoke tests for build artifact presence.
- Manual test cases for Obsidian UI behavior.

---

## 12. Release readiness audit

| Check | Status | Evidence | Severity if violated | Notes |
|---|---|---|---:|---|
| `manifest.json` version follows `x.y.z`. |  |  | Blocker | No leading `v` in manifest version. |
| Git tag exactly matches `manifest.json` version. |  |  | Blocker | Example: `1.0.0`. |
| GitHub release is created for the same version. |  |  | Blocker | Required for installation. |
| Release assets include `main.js`. |  |  | Blocker | Required. |
| Release assets include `manifest.json`. |  |  | Blocker | Required. |
| Release assets include `styles.css` if plugin uses CSS. |  |  | High | Optional only if not needed. |
| Release assets are uploaded as individual binary attachments. |  |  | Blocker | Not only inside source archives. |
| README and manifest are committed to the default branch before submission. |  |  | Blocker | Directory processes manifest from default branch HEAD. |
| Release notes explain user-facing changes. |  |  | Medium | Useful for users and reviewers. |
| Initial submission has only one required submission to the community directory. |  |  | Info | Updates are handled through GitHub releases. |

---

## 13. Beta-testing audit

Obsidian does not officially support beta releases. Use BRAT or manual installation for beta testers.

| Check | Status | Evidence | Notes |
|---|---|---|---|
| Beta installation method is documented. |  |  | Recommended: BRAT. |
| Beta testers are told which platforms to test. |  |  | Include Windows, macOS, Linux, Android, and iOS as applicable. |
| Beta testers are told how to report bugs. |  |  | Use GitHub issues or a clear form. |
| Beta testers are told what data may be touched by the plugin. |  |  | Especially important for file-modifying plugins. |
| Test vault recommendation is included. |  |  | Avoid risking users’ primary vaults during beta. |
| Known limitations are documented. |  |  | Avoid surprise failure modes. |
| Rollback or uninstall instructions are included. |  |  | Include how to disable/remove the plugin. |

### 13.1 Manual beta test matrix

| Scenario | Platform | Steps | Expected result | Actual result | Pass/Fail | Notes |
|---|---|---|---|---|---|---|
| Install plugin | Windows |  |  |  |  |  |
| Install plugin | macOS |  |  |  |  |  |
| Install plugin | Linux |  |  |  |  |  |
| Install plugin | Android, if supported |  |  |  |  |  |
| Install plugin | iOS, if supported |  |  |  |  |  |
| Enable plugin |  |  |  |  |  |  |
| Disable plugin |  |  |  |  |  |  |
| Update plugin |  |  |  |  |  |  |
| Uninstall plugin |  |  |  |  |  |  |
| Main workflow 1 |  |  |  |  |  |  |
| Main workflow 2 |  |  |  |  |  |  |
| Settings migration |  |  |  |  |  |  |
| Error handling |  |  |  |  |  |  |
| Large vault performance |  |  |  |  |  |  |

---

## 14. Audit scoring

Use this scoring method for a quick release gate.

| Gate | Condition | Result |
|---|---|---|
| Policy gate | Any blocker policy violation exists. | Do not beta or submit. |
| Security gate | Any unsafe DOM, remote code execution, hidden telemetry, or undisclosed network use exists. | Do not beta or submit. |
| Release gate | Manifest, tag, or release assets are invalid. | Do not submit. |
| Build gate | Clean install or build fails. | Do not release. |
| Documentation gate | README lacks purpose, usage, platform support, or required disclosures. | Do not submit. |
| Quality gate | Only medium/low issues remain. | Release candidate may proceed with tracked issues. |

Recommended summary format:

| Area | Pass | Needs work | Fail | Unknown | Blockers |
|---|---:|---:|---:|---:|---:|
| Policy |  |  |  |  |  |
| Manifest |  |  |  |  |  |
| Code security |  |  |  |  |  |
| Obsidian API usage |  |  |  |  |  |
| UI and styling |  |  |  |  |  |
| Documentation |  |  |  |  |  |
| Build and CI |  |  |  |  |  |
| Release |  |  |  |  |  |
| Beta testing |  |  |  |  |  |

Final decision:

- **Ready** — no blockers or high-severity issues.
- **Ready with conditions** — no blockers; high-severity issues have accepted mitigation or are not release-relevant.
- **Not ready** — one or more blockers or unresolved high-severity release risks.

---

## LLM audit prompt pack

### Prompt 1 — Full repository audit

Use this prompt when the LLM can read the whole repository.

```text
You are auditing an Obsidian community plugin repository for policy compliance, release readiness, code quality, security, and documentation quality.

Use this source hierarchy:
1. Obsidian Developer policies.
2. Obsidian plugin submission requirements.
3. Obsidian plugin guidelines and release guidance.
4. Obsidian Help style guide.
5. Google developer documentation style guide.
6. Microsoft Writing Style Guide.
7. Project-specific conventions only when they do not conflict with the above.

Audit scope:
- Developer policy compliance.
- Manifest correctness.
- Release readiness.
- Security-sensitive code patterns.
- Obsidian API best practices.
- Mobile compatibility.
- Resource lifecycle cleanup.
- UI text and settings style.
- README and documentation quality.
- Build, typecheck, lint, test, and CI readiness.

Repository context:
- Plugin name: <PLUGIN_NAME>
- Plugin ID: <PLUGIN_ID>
- Target release: <BETA | INITIAL_SUBMISSION | UPDATE>
- Package manager: <pnpm | npm | yarn | unknown>
- Build command: <COMMAND>
- Check command: <COMMAND>
- Test command: <COMMAND_OR_NONE>

Required method:
1. Inspect `manifest.json`, `package.json`, README, LICENSE, source files, CSS, CI workflows, and release scripts.
2. Search for prohibited or risky patterns, including telemetry, ads, self-update mechanisms, remote code execution, unsafe DOM APIs, unnecessary network use, Node.js or Electron API use, direct Adapter API usage, broad file iteration, unnormalized paths, and resource leaks.
3. Verify that release assets and versioning rules are satisfied.
4. Evaluate README and UI text against Obsidian, Google, and Microsoft style guidance.
5. Produce evidence-based findings only. Do not speculate. If something cannot be verified, mark it as Unknown.

Output format:

# Obsidian plugin audit report: <PLUGIN_NAME>

## Executive summary
- Final decision: Ready / Ready with conditions / Not ready
- Blockers: <count>
- High severity: <count>
- Medium severity: <count>
- Low severity: <count>
- Main release risk: <one sentence>

## Audit metadata
| Field | Value |
|---|---|
| Plugin | |
| Plugin ID | |
| Version | |
| Commit | |
| Target release | |
| Audited date | |

## Gate results
| Gate | Result | Reason |
|---|---|---|
| Policy gate | Pass/Fail/Unknown | |
| Security gate | Pass/Fail/Unknown | |
| Manifest gate | Pass/Fail/Unknown | |
| Build gate | Pass/Fail/Unknown | |
| Documentation gate | Pass/Fail/Unknown | |
| Release gate | Pass/Fail/Unknown | |

## Findings
| ID | Area | Severity | Status | Evidence | Risk | Recommended fix | Verification |
|---|---|---:|---|---|---|---|---|

## Required fixes before release
List only blocker and high-severity issues.

## Recommended improvements
List medium and low-severity issues.

## Positive observations
List practices that already meet the standards.

## Unknowns
List items that could not be verified and what evidence is needed.

Rules:
- Include file paths and line numbers whenever possible.
- Do not rewrite code unless asked.
- Do not mark a check as Pass without evidence.
- Prioritize policy and release blockers over polish issues.
```

---

### Prompt 2 — Policy, privacy, and security audit

```text
Audit this Obsidian plugin for policy, privacy, and security risks.

Focus on:
- Obfuscated code that hides purpose.
- Dynamic ads loaded over the internet.
- Static ads outside the plugin’s own interface.
- Client-side telemetry.
- Self-update mechanisms.
- Network use that is not clearly disclosed.
- Payment, account, server-side telemetry, closed-source code, or outside-vault file access that is not disclosed.
- Unsafe DOM APIs: `innerHTML`, `outerHTML`, `insertAdjacentHTML`.
- Remote code execution: `eval`, `new Function`, script injection, remote imports.
- Data exfiltration risks: vault content, note names, paths, settings, user identity, or file contents sent outside the vault.
- Secrets or tokens in source code.

Search commands to run or simulate:

```bash
rg "innerHTML|outerHTML|insertAdjacentHTML|eval\(|new Function|document\.write|createElement\(['\"]script" .
rg "fetch\(|requestUrl\(|XMLHttpRequest|WebSocket|sendBeacon|analytics|telemetry|tracking|metrics|posthog|segment|amplitude|sentry" .
rg "auto.?update|self.?update|download.*main\.js|manifest\.json.*download|gh release|remote.*script" .
rg "api[_-]?key|token|secret|password|bearer|authorization" .
```

Output:

1. Executive risk summary.
2. Blocker findings.
3. High-risk findings.
4. Disclosure gaps.
5. False positives reviewed.
6. Exact fixes and verification steps.

Rules:

- Treat hidden telemetry and self-update mechanisms as blockers.
- Treat undisclosed network use as high severity or blocker depending on impact.
- Treat unsafe DOM with user-controlled input as high severity or blocker.
- Do not assume network use is acceptable just because it is documented in code; it must be disclosed to users.

```text

---

## Prompt 3 — Manifest and release readiness audit

```text
Audit the Obsidian plugin manifest and release readiness.

Inspect:
- `manifest.json`
- `package.json`
- release workflow files
- Git tags, if available
- GitHub release assets, if available
- README installation instructions

Check:
- `id`, `name`, `author`, `version`, `minAppVersion`, `description`, and `isDesktopOnly` exist.
- `version` uses `x.y.z` Semantic Versioning.
- Git tag exactly matches the manifest version.
- Release contains individual binary attachments: `main.js`, `manifest.json`, and `styles.css` if used.
- `description` is 250 characters maximum, action-oriented, ends with a period, uses correct capitalization, and does not start with “This is a plugin”.
- `id` does not contain `obsidian`.
- `fundingUrl` is only used for financial support services.
- `isDesktopOnly` is `true` if Node.js or Electron APIs are used.
- README, LICENSE, and manifest are committed in the root repository.

Output:
| Check | Status | Evidence | Risk | Fix |
|---|---|---|---|---|

Then provide:
- Release blocker list.
- Exact release preparation steps.
- Version/tag/assets verification commands.

Use this final decision:
- Ready: no blockers.
- Not ready: any required manifest field, version, tag, or release asset is invalid.
```

---

### Prompt 4 — Obsidian API and lifecycle audit

```text
Audit the plugin’s use of the Obsidian API and lifecycle patterns.

Focus on:
- Avoiding global `app` and `window.app`.
- Cleaning up resources on unload.
- Using `registerEvent`, `registerDomEvent`, `registerInterval`, and plugin registration helpers where practical.
- Avoiding unnecessary `onunload` leaf detachment.
- Using appropriate command callback types.
- Avoiding default hotkeys unless justified.
- Avoiding direct `workspace.activeLeaf` access.
- Using `getActiveViewOfType()` or `activeEditor` when appropriate.
- Using `Editor` for active note edits.
- Using `Vault.process()` for background edits.
- Using `FileManager.processFrontMatter()` for frontmatter changes.
- Preferring Vault API over Adapter API for vault operations.
- Avoiding `getFiles().find(...)` path lookups.
- Using `normalizePath()` for user-defined paths.

Suggested searches:

```bash
rg "window\.app|\bapp\." src main.ts
rg "registerEvent|registerDomEvent|registerInterval|addCommand|onunload|detach|setInterval|addEventListener" src main.ts
rg "activeLeaf|activeEditor|getActiveViewOfType|getActiveLeavesOfType|registerView" src main.ts
rg "vault\.modify|vault\.process|processFrontMatter|vault\.adapter|getFiles\(\).*find|getFileByPath|getAbstractFileByPath|normalizePath" src main.ts
```

Output:

- API misuse findings.
- Lifecycle leak risks.
- File operation risks.
- Suggested refactors with file paths.
- Verification plan.

Rules:

- Do not recommend large rewrites unless the current pattern creates clear risk.
- Prefer small, reviewable refactors.

```text

---

## Prompt 5 — README and documentation style audit

```text
Audit the plugin README and user-facing documentation for clarity, completeness, and style.

Apply this hierarchy:
1. Obsidian Help style guide.
2. Google developer documentation style guide.
3. Microsoft Writing Style Guide.

Check content completeness:
- Purpose.
- Features.
- Installation.
- Usage.
- Settings.
- Platform support.
- Required disclosures.
- Privacy and data handling.
- Known limitations.
- Troubleshooting.
- Development commands.
- License and attribution.

Check style:
- Global English.
- Active voice.
- Second person where appropriate.
- Sentence case headings.
- Numbered steps for sequential procedures.
- Bullets for non-sequential lists.
- Descriptive link text.
- UI labels in bold.
- Code formatting for commands, file names, package names, and symbols.
- Correct Obsidian terminology: note, active note, folder, keyboard shortcut, heading, sidebar, sync, search term.
- Avoid idioms, vague claims, and culture-specific expressions.
- Avoid “click” when “select” works across input methods; use “tap” only for mobile-specific instructions.

Output:
1. Missing documentation sections.
2. Style violations table.
3. Suggested README outline.
4. Rewritten examples for the worst sections.
5. Final documentation readiness decision.

Rules:
- Preserve the plugin’s meaning.
- Prefer concise, direct language.
- Do not invent features.
- Mark unknowns where the README lacks evidence.
```

---

### Prompt 6 — Beta test plan generator

```text
Create a beta test plan for this Obsidian plugin.

Inputs:
- Plugin name: <PLUGIN_NAME>
- Plugin ID: <PLUGIN_ID>
- Supported platforms: <Windows/macOS/Linux/Android/iOS>
- Main workflows: <LIST>
- Risky operations: <file writes/network/settings migration/frontmatter edits/etc.>
- Installation method: BRAT / manual / both

The plan must include:
1. Beta scope.
2. Installation instructions.
3. Test vault recommendation.
4. Platform matrix.
5. Main workflow test cases.
6. Regression test cases.
7. Error handling test cases.
8. Performance checks for large vaults.
9. Data safety checks.
10. Bug report template.
11. Rollback and uninstall instructions.
12. Exit criteria for release readiness.

Use clear numbered steps for procedures and concise tables for test cases.
```

---

### Prompt 7 — Fix plan from audit findings

```text
Convert these Obsidian plugin audit findings into an implementation plan.

Input findings:
<PASTE_FINDINGS>

Create:
1. A prioritized fix roadmap.
2. One GitHub issue per fix.
3. Acceptance criteria for each issue.
4. Verification commands or manual tests.
5. Suggested branch names.
6. Suggested commit messages.
7. Release gate checklist.

Prioritization rules:
- Blockers first.
- Then high-severity release risks.
- Then security and data safety issues.
- Then documentation gaps.
- Then maintainability and polish.

Output format:

## Fix roadmap
| Priority | Finding ID | Issue title | Severity | Owner | Verification |
|---:|---|---|---|---|---|

## GitHub issues
### <Issue title>
Problem:
Impact:
Required change:
Acceptance criteria:
Verification:
Suggested branch:
Suggested commit:
```

---

### 15. Practical audit workflow

Use this workflow with an LLM coding agent or manual review.

1. Run the full repository audit prompt.
2. Run the policy/security prompt separately.
3. Run the manifest/release prompt.
4. Run the README/style prompt.
5. Merge all findings into one audit table.
6. Deduplicate findings by file and root cause.
7. Convert blocker and high-severity findings into GitHub issues.
8. Fix blockers.
9. Re-run the same prompts.
10. Prepare beta testing with BRAT.
11. Run beta test matrix.
12. Prepare release assets and submission.

---

### 16. Recommended repository commands

Adapt these to the plugin repository.

```bash
# clean install
pnpm install --frozen-lockfile

# quality gates
pnpm run build
pnpm run check
pnpm run test
pnpm run lint
pnpm run typecheck

# inspect release assets
ls -la main.js manifest.json styles.css

# inspect manifest
cat manifest.json

# compare package and manifest versions
node -e "const p=require('./package.json'); const m=require('./manifest.json'); console.log({package:p.version, manifest:m.version, same:p.version===m.version})"

# check suspicious patterns
rg "innerHTML|outerHTML|insertAdjacentHTML|eval\(|new Function|fetch\(|requestUrl\(|telemetry|analytics|tracking|auto.?update|window\.app|activeLeaf|vault\.adapter|getFiles\(\).*find" .
```

---

### 17. Minimum release gate

Do not release or submit until all of these are true:

- No prohibited policy behavior exists.
- Required disclosures are present in README.
- `LICENSE`, `README.md`, and `manifest.json` exist in the repository root.
- Manifest required fields are valid.
- `id` does not contain `obsidian`.
- `description` is short, clear, and compliant.
- `isDesktopOnly` correctly reflects Node.js or Electron API usage.
- Clean install works.
- Build works.
- Typecheck and lint pass, or exceptions are documented and justified.
- Release tag exactly matches `manifest.json` version.
- GitHub release has individual `main.js`, `manifest.json`, and optional `styles.css` assets.
- README explains purpose, usage, platform support, privacy/data handling, and limitations.
- Beta testers have validated the main workflows on supported platforms.
