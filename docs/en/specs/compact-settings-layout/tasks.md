# Compact settings tasks

Status: IMPLEMENT authorized by maintainer on 2026-09-14: "oke implementasikan".
T01–T06 implementation and automated verification completed. Maintainer
confirmed the final layout and authorized local main integration on 2026-09-14.
Full H01–H06 scenario coverage remains Pending; no deployment is authorized.
Contracts: [accepted spec](./spec.md) and [accepted plan](./plan.md).

## Execution rules

Execute sequentially: T01 → T02 → T03 → T04 → T05 → T06. T02 and T03
both depend on T01; use this order to avoid overlapping settings composition
changes. Each implementation slice includes regression tests and a user-doc
update. Use incremental implementation, TDD for behavior changes, and UI
engineering guidance. Preserve local work; no commit, push, release, or vault
deployment is authorized by task approval alone.

Run targeted Vitest tests with
`node node_modules/vitest/vitest.mjs run <test-file>`; the existing
`scripts/test.mjs` does not forward file arguments. Use `pnpm run test` for
the full suite. Initialize fnm for Node 24 and use pinned pnpm.
Run `pnpm run check` for each slice. Do not advance past a failing gate without
diagnosis and repair. Mock DOM evidence and actual Obsidian acceptance are
recorded separately below.

## T01 — Overview and capability navigation

- [x] Replace the 14-tab bar with the overview: inline General/GitHub
  compatibility and active-mode selector; compact Toolbar, Callouts, preset,
  and capability rows. Each row opens a single detail page with Back/title.
- [x] Native buttons support keyboard activation; navigation manages title
  focus and restores originating-row focus and overview scroll on Back.
  Existing feature renderers and CSS compatibility hooks remain usable.
- [x] Direct Callouts navigation, preview cleanup, Toolbar redraw guards,
  and stale-callback protection work across navigation and hide/reopen.

Dependencies: none. Spec acceptance: 1–3, 6.
Files (medium): `src/components/settings-tab.ts`,
`src/components/settings-navigation.ts` if extraction is useful,
`src/styles/ui/_settings.scss`, `tests/settings-navigation.test.ts`,
`docs/for-users/use-md-writer-features.md`.
Verify: navigation harness for overview/detail/Back, grouping, focus/scroll
model, direct Callouts, cleanup, hide, and stale redraw; `pnpm run check`.
Host QA: H01–H04. Temporary preset detail may use the existing recipe renderer
until T02; the overview must never render all recipe switches.

## T02 — Focused preset editing

- [x] Each preset row renders only that mode's eight editable switches;
  returning to the overview does not render expanded recipe lists.
- [x] Recipe edits save only the recipe, without toggling live capabilities;
  reopening the detail preserves the saved changes.
- [x] Active-mode selection retains existing apply behavior and None semantics.

Dependencies: T01. Spec acceptance: 1–2, 6.
Files (medium): `src/capabilities/features/writing-modes/preset-config.ts`,
`src/components/settings-tab.ts`, `tests/writing-mode-presets.test.ts`,
`tests/settings-navigation.test.ts`,
`docs/for-users/use-md-writer-features.md`.
Verify: test selected-mode rendering, edit/save separation, reopen, and
overview isolation; `pnpm run check`. Host QA: H05.

## Checkpoint A — after T01–T02

- [x] Targeted tests and `pnpm run check` pass; navigation and preset paths
  are reviewed against spec acceptance 1–3 and 6.
- [x] Record any actual host evidence and pending cases; do not treat mock
  focus tests as host acceptance. Share outcome before proceeding.

## T03 — Combined scrolling settings

- [x] Typewriter detail includes Typewriter and Keep Lines sections with
  clear alternative-scrolling guidance and no separate Keep Lines row.
- [x] Toggling a scrolling option refreshes the mutually disabled controls
  immediately; the user can turn the active option off and select the other.
- [x] Existing persisted keys, values, toggle side effects, and scrolling
  algorithms remain compatible; unrelated FeatureToggle renderers are unchanged.

Dependencies: T01. Spec acceptance: 3, 6.
Files (medium): `src/components/settings-tab.ts`,
`src/components/typewriter-settings.ts` if useful for local refresh,
`tests/typewriter-settings.test.ts`,
`tests/settings-navigation.test.ts`,
`docs/for-users/use-md-writer-features.md`.
Verify: render state for neither/Typewriter/Keep Lines enabled, control
refresh after toggles, existing side effects, and stale-page guard;
`pnpm run check`. Host QA: H06.

## T04 — Requested default recipes

- [x] Assert every cell of the spec matrix; set Normal/Outliner On and
  Writing/Hemingway Off. Initial active mode stays None.
- [x] Missing preset values receive defaults; explicit saved recipes,
  including old complete recipes and customized false values, stay intact.
- [x] Normal and Writing descriptions match the new recipes; activation
  tests cover Normal, Writing, and None without changing apply semantics.

Dependencies: T02. Spec acceptance: 4–6.
Files (medium): `src/capabilities/settings.ts`,
`src/capabilities/features/writing-modes/active-mode.ts`,
`src/capabilities/features/writing-modes/preset-config.ts`,
`tests/settings.test.ts`, `tests/commands.test.ts`.
Verify: failing matrix/default-activation tests before implementation,
then migration and activation regressions pass; `pnpm run check`.
Record the new-default/existing-recipe distinction in T05. Host QA: H05.

## Checkpoint B — after T03–T04

- [x] Relevant settings, preset, scrolling, and command tests pass with
  `pnpm run check`; review saved-data compatibility and dependency direction.
- [x] Compare implementation against the whole matrix and grouping contract;
  record pending host acceptance and share outcome before final verification.

## T05 — Canonical documentation and review

- [x] User docs describe overview/detail navigation, combined scrolling
  settings, full default matrix, and preservation of saved recipes.
- [x] Current state and architecture describe verified implementation;
  development status separates automated evidence from pending host QA.
- [x] Add user-facing changelog notes using the existing version format;
  review source/tests/docs for compatibility, lifecycle, and unnecessary complexity.

Dependencies: T01–T04. Spec acceptance: 5–8.
Files (medium): `docs/for-users/use-md-writer-features.md`,
`docs/current-state.md`, `docs/reference/code-architecture-baseline.md`,
`docs/development-status.md`, `CHANGELOG.md`.
Verify: manual requirement-to-file review; `pnpm run check` and T06 docs build.
Any necessary review fix returns to its owning slice and reruns affected tests.

## T06 — Final gates and acceptance ledger

- [x] `pnpm run check:ci` passes QA, behavior tests, build, artifact checks,
  and documentation build; record commands and actual results.
- [x] Review final diff against spec acceptance 1–8 and link tests/evidence
  in this ledger. Update task status and documentation navigation labels.
- [x] Host cases have explicit Pass/Fail/Pending evidence. Handover states
  remaining acceptance without claiming shipped readiness or creating a release.

Dependencies: T05. Spec acceptance: 7–8.
Files (medium): this `tasks.md`, `docs/development-status.md`,
`docs/README.md`, `docs/index.md`, and `plan.md` for final status if necessary.
Verify: `pnpm run check:ci`, final diff/status review. No implicit vault deploy.

## Host acceptance ledger

Maintainer confirmed the final layout on 2026-09-14: "oke confirmed merge to
main". This accepts the reported visual corrections; it does not establish
every keyboard/mobile/popout/scrolling scenario below. Actual scenario evidence
is required for Pass.

| ID | Scenario | Status | Evidence |
| --- | --- | --- | --- |
| H01 | Desktop overview and each capability/detail; Back scroll restoration | Pending | — |
| H02 | Keyboard Enter/Space, title focus, Back focus, visible focus styles | Pending | — |
| H03 | Narrow mobile layout, touch navigation, hide/reopen | Pending | — |
| H04 | Popout, direct Callouts entry, preview cleanup, Toolbar reorder/redraw | Pending | — |
| H05 | Edit/reopen recipe; activate Normal/Writing/None; saved overrides retained | Pending | — |
| H06 | Switch Typewriter/Keep Lines through Off; immediate control state and scrolling | Pending | — |

## Automated evidence ledger

Maintainer follow-up: Toolbar and Callouts navigation rows now belong inside
the same General card, following the General and GitHub controls. Descriptions
and detail navigation remain intact; the grouping regression covers both rows.

Visual correction from maintainer screenshots (2026-09-14): unified General
SettingGroup, shared preset/capability panels, descriptive Toolbar rows/detail,
Capabilities explanation, and aligned header with accessible chevron Back.
Navigation regression reproduced separate General/GitHub groups before the
fix; four navigation tests pass after correction. Screenshots are evidence of
the previous layout's visual issues, not acceptance of the corrected layout.
Full `pnpm run check:ci` after correction passed QA, 22 files / 141 tests,
plugin build, artifact verification 1.1.0, and VitePress build. H01–H06 remain
Pending for the corrected UI.

| Slice | Relevant tests | QA result | Status |
| --- | --- | --- | --- |
| T01 | settings-navigation.test.ts | check passed | Automated; host pending |
| T02 | writing-mode-presets.test.ts; settings-navigation.test.ts | check passed | Automated; host pending |
| T03 | typewriter-settings.test.ts | check passed | Automated; host pending |
| T04 | settings.test.ts; commands.test.ts | check passed | Automated; host pending |
| T05–T06 | Manual review; 22 files / 140 tests | check:ci passed | Automated; host pending |

Evidence: targeted navigation tests initially failed against the old layout;
the complete default matrix and Normal/Writing activation tests produced four
failures before changing defaults. Final targeted run passed 5 files / 28 tests.
Full `pnpm run check:ci` passed QA, 22 files / 140 tests, plugin build,
artifact verification for 1.1.0, and VitePress build. Commands ran on Node
24.19.0 with pinned pnpm. Biome/Obsidian UI lint failures were diagnosed and
fixed before the final successful gate. Only General's requested grouping has
a documented local lint exception; no gate was bypassed.
