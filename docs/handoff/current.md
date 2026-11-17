# Current handoff

Date: 2026-11-16.
Branch: `claude/quality-hardening`.
State: S1, S2 and S3 committed; the QH-03 plan is validated, its implementation and the release steps are pending. Native checkpoints 1, 1b and 1c are recorded. QH-06 is fixed and verified natively for tab and space indentation; the QH-07 spec is next.
Current owner: Windows native-testing agent, returning the turn.
Next owner: Ubuntu development agent: read the checkpoint 1c result, then the QH-07 spec and QH-03.
Code SHA under test: `de6dabd` for checkpoint 1c (the QH-06 fix; `141a78c` was the SHA for checkpoints 1 and 1b). Resolve the full SHA with `git rev-parse 141a78c` on branch `claude/quality-hardening`. The branch is pushed to `origin/claude/quality-hardening` (2026-11-16). No pull request is open.
Source base: `f2ae9af1705777edde86015dbf2c0f3ac4a16c39` (main).

## Read first

- [Agent instructions](../../AGENTS.md) and [protocol](README.md), including the CLI rules.
- [Quality audit](../audit/2026-11-16-quality-pass/REPORT.md).
- [Spec](../specs/quality-hardening/spec.md), [plan](../specs/quality-hardening/plan.md), [task ledger](../specs/quality-hardening/tasks.md).
- [QH-03 spec](../specs/outline-view-split/spec.md), [plan](../specs/outline-view-split/plan.md), [tasks](../specs/outline-view-split/tasks.md).

## Work done

- S1 (QH-01): `applyStartupMigrations` clones `DEFAULT_SETTINGS` per load, in the current and legacy paths. Two new tests in `tests/settings.test.ts` failed before the change and pass after.
- S2 (QH-04, QH-05): dated `minimatch` override comment; `setup-test-vault.ts` uses `JSON.stringify`.
- S3 (QH-02): new tests for `list-service.ts` and `keyboard-ops.ts` (43 tests) over a fixture tree; 18 conditions inverted, all caught. Coverage floor raised to 37/39/33/37. `fold-persist.ts` stays covered by the browser regression, not by vitest.
- QH-03: plan validated against the code and corrected (step B narrowed).
- Documents: quality audit, spec, plan, tasks, and this handoff.

## Checks and evidence

All run inside bubblewrap (no network, cleared environment, read-only source and toolchain, scratch on tmpfs), Node 24.15.0 from fnm.

- `vitest run`: 38 files, 350 tests passed. Baseline before S1 was 305 tests. Coverage totals 38.00 statements, 39.97 branches, 33.60 functions, 37.86 lines.
- `tsc --noEmit`, `biome check`, `eslint src manifest.json LICENSE`: no errors.
- `commitlint` on the S1 message: 0 problems.
- S1 commit: git hooks bypassed with a command-scoped `core.hooksPath=/dev/null`. Later commits ran the hooks normally (typecheck, lint, tests) and passed.
- Not run: coverage, build, `verify:artifacts`, conformance, `pnpm audit` (needs network), lint:styles, lint:md for code changes.
- Native acceptance: not run.

## Blockers

- Resolved: the `gh` token is valid again and the branch is pushed. Still open: branch protection (`Verify`, `Test (Windows)`, `Commit messages`) and `RELEASE_TOKEN` are not set; they need the maintainer's approval. Set `RELEASE_TOKEN` before the protection, or the Release PR never gets its required checks.
- No pull request is open. The maintainer chose one branch and one pull request; its title must be `fix: ...`.

## Native checkpoints requested from Windows

Checkpoint 1 is requested now, at `141a78c`. Checkpoints 2 and 3 are not yet.

1. Checkpoint 1, requested (S1, S2, S3): reload with a `data.json` that has no `foldPersist` key. Fold and unfold a list in one note, reload the plugin, and confirm other notes keep their default fold behavior and no console error appears. Then repeat with a legacy flat `data.json`. Also check, in a note with nested lists: Tab, Shift+Tab, Enter (end and middle of an item, on an empty nested item and an empty root item), move item up and down, Home and Left at the marker. These cover the logic the new tests assume; the fixture assumes a list-line node covers its line end, which only native use can confirm. Report pass or fail per step, with console errors.
2. After QH-03 (S5): Outline panel on a note with headings, nested lists and tasks, in the main window and a popout. Switch the three filters, collapse and expand, toggle a task, and reveal the active node. Compare with the same note on the 0.0.1 build.
3. Before the 0.0.2 Release PR is merged: install the built `main.js`, `manifest.json` and `styles.css` from the Release PR's artifact and repeat steps 1 and 2.

## Next actions for Ubuntu

1. Wait for the Windows result on checkpoint 1.
2. Run coverage-gated `pnpm run verify` pieces not yet run (build, `verify:artifacts`, conformance) when the sandbox allows.
3. S5: the plan is validated; wait for the maintainer to approve the corrections, then write O1 tests and extract entries first.
4. Update this file at each checkpoint, push when authorized, then request native testing.

## Authorization boundaries

- Authorized: local implementation of S1 to S5 on this branch, commits, documentation.
- Not authorized without a new approval: push, opening the pull request, merging, merging a Release PR, tagging, publishing, changing GitHub settings or secrets, deploying to a working vault.

## Native checkpoint 1 result (Windows)

Tested code SHA: `141a78c05a44f1ce809ed6caa2916ec02ef1cc2d` (branch head `9592a40` adds documentation only).
Environment: Windows 11, Obsidian 1.15.1 (installer 1.15.1), disposable vault `unisastra-testvault`, plugin built and deployed with `pnpm run deploy` in `runtime` verification mode. No working vault was touched. The first deploy attempt failed with "Obsidian CLI did not return valid vault/config metadata"; the identical retry passed and the cause is unknown.

Automated on Windows: `pnpm install --frozen-lockfile`, then `pnpm run verify` passed, including build, `verify:artifacts` and 20 of 20 conformance tests. Vitest: 38 files, 350 tests. Coverage 37.86 lines, 39.97 branches, 33.6 functions, matching the Ubuntu numbers.

| Step | Result | Source |
| --- | --- | --- |
| Reload with a `data.json` that has no `foldPersist` key | Passed: plugin loads, no console error, key rewritten as `{"isFoldPersistEnabled":false,"foldState":{}}` | Settings file and CLI |
| Fold a list, reload the plugin | Passed: the fold survives, no console error. `isFoldPersistEnabled` is false, so this is Obsidian's own fold state and says nothing about `fold-persist.ts` | CLI |
| Other note keeps its default fold behavior after reload | Passed: no folds in the other note | CLI |
| Legacy flat `data.json` | Passed: grouped format written, legacy values kept, no console error | Settings file and CLI |
| Fixture assumption: a list-line node covers its line end | Confirmed on the live syntax tree: `HyperMD-list-line_HyperMD-list-line-1@0-3` for `- a`, `@4-10` for the nested item `- a1` | CLI, live tree |
| Tab, Shift+Tab, Enter (end, middle, empty nested, empty root), Home, Left at the marker | Inconclusive | See below |

Keyboard operations. `isKeyboardOpsEnabled`, `isCursorStickEnabled`, `isSmartEnterEnabled`, `isSmartTabEnabled` and `isSmartSelectEnabled` default to false, so a first run measured only Obsidian's behavior. I enabled all five in the test vault's `data.json`, reloaded, and reopened the editor. Synthetic `keydown` events were sent to `contentDOM`. Two discriminating cases did not show the plugin's behavior:

- `Mod-a` with the cursor inside `a1` selected the whole document. `smartSelectAll` would select the item content.
- `ArrowLeft` at the content start moved the cursor into the marker (4 to 3). `cursorStickLeft` would keep it at the content start, as `tests/keyboard-ops.test.ts` expects.

Tab, Shift+Tab, Enter and Home gave the same result with the flags on or off, so they prove nothing about the plugin. Possible causes, none verified: Obsidian's own keymaps take precedence over the plugin's, or synthetic events differ from real key presses, or the extension is not applied. `S1` to `S3` change only `settings.ts` and tests, not the keyboard code, so this is not a regression of this branch; it needs a manual check with real key presses and, if it holds, a separate fix and a native-verified test. Move item up and down was not run (the `Mod-Shift-Arrow` bindings share the same path). The commands `unisastra:indent-list-item` and `unisastra:move-list-up` left a two-item list unchanged when run through `executeCommandById`; the reason is unknown.

Cleanup: the test vault's `data.json` was restored from a backup, the temporary note was deleted, and open editors were closed.

Not run: `gh attestation verify`, native checks for checkpoints 2 and 3.

## Checkpoint 1b (requested from Windows)

Code SHA under test: unchanged, `141a78c05a44f1ce809ed6caa2916ec02ef1cc2d`. No code was changed for this request.

Why: the checkpoint 1 keyboard result is inconclusive. Ubuntu read the code; nothing was run.

Verified in code:

- `cm.dispatch` is passed unbound by the commands, which is safe: `EditorView` binds it in its constructor (`@codemirror/view` `this.dispatch = this.dispatch.bind(this)`).
- The outliner keymaps (`Mod-a`, `ArrowLeft`, `Home`, `Tab`, `Shift-Tab`, `Enter`, `Mod-Shift-ArrowUp/Down`) are registered through `registerEditorExtension` with no `Prec` (`src/lib.ts:208`, `src/cm6/outliner/index.ts`).

Hypotheses, not tested:

- H1: Obsidian's own keymaps for the same keys run first at the same precedence, so the plugin handlers never run. This fits `Mod-a` selecting the whole document and `ArrowLeft` entering the marker.
- H2: `indentListItem` and `moveListItemUp` return `false` and change nothing when the item has no previous sibling at the same depth. Run on a child item `a1` that is the first child of `a`, that is correct behavior, not a bug.

Steps, in the disposable test vault with the five keyboard flags enabled (`isKeyboardOpsEnabled`, `isCursorStickEnabled`, `isSmartEnterEnabled`, `isSmartTabEnabled`, `isSmartSelectEnabled`), then reload the plugin:

1. Note with the lines `- a` and `- b`. Put the cursor inside `b`. Run `unisastra:indent-list-item` through the command palette. Expected: `b` becomes a child of `a`. Report the resulting text.
2. Same note, cursor inside `b` (restore it first). Run `unisastra:move-list-up`. Expected: `b` and `a` swap. Report the resulting text.
3. Same note with `a1` as a child of `a`, cursor inside `a1`. Run `unisastra:indent-list-item`. Expected: no change (H2). Report the text.
4. Real key presses, not synthetic events: `Mod-a` with the cursor inside an item. Report whether the item content or the whole document is selected. Then `ArrowLeft` at the content start of an item, and `Tab` and `Enter` at the end of an item. Report the text and cursor each time.
5. Repeat step 4 with the five flags off. If the results are identical, H1 is supported.

Report pass or fail per step with console errors, and restore the vault data afterwards. Do not change plugin code. Whether to add `Prec.high` is a maintainer decision, to be made after this result.

## Checkpoint 1b result, steps 1 to 3 (Windows)

Tested code SHA: `141a78c05a44f1ce809ed6caa2916ec02ef1cc2d`, built and deployed earlier from this branch; the branch head `3a9d2ca` adds documentation only. Obsidian 1.15.1, Windows 11, disposable vault `unisastra-testvault`, the five keyboard flags enabled and the plugin reloaded.

Method difference: the commands ran through `app.commands.executeCommandById` on the active editor, not the command palette, and the text was set with `setValue`. Steps 4 and 5 (real key presses) are not run; they need the maintainer.

| Step | Input and cursor | Expected | Observed |
| --- | --- | --- | --- |
| 1 | `- a` / `- b`, cursor in `b`, `indent-list-item` | `b` becomes a child of `a` | Text unchanged; the command returned true |
| 2 | same, `move-list-up` | `a` and `b` swap | Text unchanged |
| 3 | `- a` with a nested `- a1`, cursor in `a1`, `indent-list-item` | No change (H2) | No change |
| extra | `- a` with a nested `- a1`, cursor in `a1`, `outdent-list-item` | `a1` becomes a root item | Became a root item, but the cursor landed at column 1 instead of 3 |
| extra | `- a` / `- b` / `- c`, cursor in `c`, `indent-list-item`, one second after `setValue` | `c` indents | Unchanged, so a parse delay does not explain step 1 |
| extra | `- a` / `- b`, cursor in `a`, `move-list-down` | swap | Unchanged |

Reading: H2 does not explain step 1. `b` has a previous sibling at the same depth, and `tests/keyboard-ops.test.ts` expects `indentListItem` to indent it, yet nothing changed in the live editor. `outdent-list-item` works on the same path (`resolveListItem` finds the item), so the failure is specific to `indentListItem`, `moveListItemUp` and `moveListItemDown`, which depend on `getPreviousSibling` and `getNextSibling`. The live syntax tree names list lines `HyperMD-list-line_HyperMD-list-line-N`, which the regex accepts, so the cause is not found. Not run: reading the sibling lookup against the live tree line by line. The outdent cursor offset (column 1, expected 3) is a second, separate observation.

Cleanup: the vault's `data.json` was restored, the temporary note deleted, editors closed. No plugin code was changed.

## Checkpoint 1b result, steps 4 and 5, and corrections (2026-11-17)

Source: maintainer report with real key presses and the command palette, Obsidian 1.15.1, disposable vault `unisastra-testvault`. Windows did not observe these steps; the table repeats what was reported. Code SHA under test is unchanged, `141a78c`.

| Case | Flags on | Flags off |
| --- | --- | --- |
| `Mod-a` in or before `a1` | Selects `a1` only; a second press selects everything | Selects everything |
| `ArrowLeft` | Reported as changing the bullet to a minus sign; the wording is ambiguous and the cursor position was not confirmed | Same as flags on |
| `Home` at the end of `a1` | Cursor before `a1`, after the marker | Same |
| `Tab` at the end of `b` | `b` becomes a child of `a`, level with `a1` | Not recorded |
| `Enter` at the end of an item | New item at the level of the previous one | Not recorded |
| Palette "Indent list item", "Move list item up" | No change | Both work |

Corrections to the Windows record above:

- H1 (Obsidian's keymaps run first) is refuted: the plugin's handlers run on real key presses. The earlier "inconclusive" came from synthetic `keydown` events, which do not reproduce the plugin's behavior. Do not use them as evidence.
- The statement that `indentListItem` and the move functions fail in the live editor rests on `executeCommandById`, which is not trustworthy. The maintainer's palette report agrees only for the flags-on case. The real finding is QH-08.
- A later CLI run found the vault still had `isKeyboardOpsEnabled` true, so it was not a clean flags-off run and is not evidence.

New findings, recorded in the [ledger](../specs/quality-hardening/tasks.md):

- QH-06, Outline panel list depth is wrong for tab indentation. Ubuntu: write a failing test first. The fix sits in the file QH-03 splits, so do both in that order.
- QH-07, [ADR-008](../reference/decisions/ADR-008-native-smart-lists-and-outline-ops.md): Obsidian 1.15 Smart lists replace the editor list operations. The maintainer decided to remove the plugin's editor commands and keyboard flags and keep the Outline panel operations. This is a direction only; write a spec before any removal.
- QH-08, palette commands change nothing with the flags on; likely retired by QH-07.

Maintainer decisions still open: the settings migration and removed command IDs (see ADR-008), and whether 0.0.2 carries the removal or only the `fix:` changes.

Test vault state at the end of this round: `isKeyboardOpsEnabled` is true, the other four flags are false, and "Indent using tabs" is off. The vault is disposable.

## Checkpoint 1c (requested from Windows): which path builds the Outline panel's list entries

Code SHA under test: `de6dabd23fcdf8f75f8376353d81d258723389a7`, first commit that contains the QH-06 text-path fix. Build and deploy it to the disposable vault as before. Branch head adds documentation only.

Question. `collectOutlineEntries` in `src/components/outline-view.ts` reads entries from the syntax tree and falls back to parsing text only when the tree gives none. The tree reader matches list items by the node name `ListItem` and headings by `ATXHeading*` or `SetextHeading1/2`. Checkpoint 1 showed the live tree names list lines `HyperMD-list-line_HyperMD-list-line-N`. If `ListItem` does not exist in the live tree, then in a note that has headings the tree gives only headings and the panel shows no list items; with no headings the text path gives the lists. This is a hypothesis from reading code; nothing here was observed.

Do not change plugin code. Report each item as observed, with the text you used.

1. Node names. In a note with a heading, a nested list and a task, read the live syntax tree (`syntaxTree(view.state)` on the editor's `cm`) and list every distinct node name that occurs on the lines of the list and the heading, including the full ancestor chain of the node at the start of a list item's content. State whether any node is named exactly `ListItem`, and what the heading nodes are called (for example `ATXHeading1` or a `HyperMD-header` name).
2. Panel with headings. Same note, Live Preview and source mode: open the Outline panel with filter "all". Record which entries it shows: headings, list items, tasks, and their levels.
3. Panel without headings. A note with only a nested list and a task: record the entries and levels.
4. Tab indentation (QH-06). A note with no heading, indented with tabs: `- a`, a tab then `- b`, two tabs then `- c`, a tab then `- d`. Expected levels in the panel: a 0, b 1, c 2, d 1. Repeat with two spaces and four spaces per level. Then add a heading above the list and record whether the list items still appear and at which levels.
5. If step 2 shows list items, say which node names the panel's tree reader must have matched, based on step 1.

Restore the vault data and the note state afterwards. Say which of the five flags were on. Real key presses are not needed for this checkpoint.

Outcome use: if list items are missing in step 2, a new finding is opened and the QH-03 split must preserve or fix that behavior on purpose; if they appear, the spec for QH-06 only needs to state the fallback rule.

## Checkpoint 1c result (Windows, 2026-11-17)

Tested code SHA: `de6dabd23fcdf8f75f8376353d81d258723389a7`. The branch head `ea3f419` differs from it only in documentation (checked with `git diff de6dabd HEAD -- src tests scripts package.json`). Windows 11, Obsidian 1.15.1, disposable vault `unisastra-testvault`, built and deployed with `pnpm run deploy`, then the plugin reloaded. A first read before the reload showed the old build and is discarded. `pnpm run verify` on Windows: 39 files, 361 tests, build and `verify:artifacts` passed, 20 of 20 conformance tests. Flags: only `isKeyboardOpsEnabled` was on. The panel was read from its DOM through the Obsidian CLI; no key presses.

| Step | Result |
| --- | --- |
| 1. Node names in a note with a heading, a nested list and a task | No node is named `ListItem`. List lines are `HyperMD-list-line_HyperMD-list-line-N`, tasks `HyperMD-list-line_HyperMD-list-line-1_HyperMD-task-line`, content nodes `list-N`. Headings are `HyperMD-header_HyperMD-header-N`, not `ATXHeading*` or `SetextHeading*`. Chain at a list item's content: `list-1`, `HyperMD-list-line_HyperMD-list-line-1`, `Document` |
| 2. Panel on a note with headings (Live Preview) | Headings and list items both appear, with the correct levels: `H1` 0, `a` 1, `b` 2, `c` 3, `d` 2, task 1, `H2` 1, `e` 2. Source mode was not run |
| 3. Panel on a note without headings | `a` 0, `b` 1, `c` 2, `d` 1, task 0 |
| 4. Indentation, no heading | Tab, two spaces and four spaces all give `a` 0, `b` 1, `c` 2, `d` 1, task 0 |
| 4. Indentation, with a heading | Tab, two spaces and four spaces all give `H` 0, `a` 1, `b` 2, `c` 3, `d` 2 |
| Extra: mixed indent (`a`, tab `b`, two-space `c`, `d`) | `a` 0, `b` 1, `c` 1, `d` 0 |
| 5. Node names the tree reader must have matched | None. See below |

Conclusion for the open question. `collectOutlineFromTree` matches `ListItem` and `ATXHeading*`/`SetextHeading*`, which the live tree does not contain. The tree reader therefore returns nothing in Obsidian 1.15.1, `collectOutlineEntries` always takes the text fallback, and the lists shown in step 2 come from the text path. The hypothesis "a note with headings loses its lists" is false in this build. The consequence is larger than the ledger assumed: the text path is the live path, so the QH-06 fix covers real use, and the tree reader is dead code in this Obsidian version. It may still run in another build or in a test, which was not checked. The QH-03 split must keep the text path as the primary behavior, and the spec should decide whether to delete the tree reader or keep it. A note longer than the first parse, or a view whose tree is partial, was not tested.

Not run: source mode, popout, a very large note, task toggling from the panel.

Cleanup: temporary notes deleted, the vault's `data.json` restored from a backup, editors closed. `qh-keys.md` is the maintainer's note and was left alone. The vault still has `isKeyboardOpsEnabled` true.
