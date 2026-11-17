# Native Smart lists spec (QH-07)

Status: D1 to D3 and D5 settled by the maintainer on 2026-11-17; D4 stays open and only affects the commit type at pull request time.
Date: 2026-11-17.
Source: [ADR-008](../../reference/decisions/ADR-008-native-smart-lists-and-outline-ops.md), [quality hardening](../quality-hardening/spec.md).

## Problem

Obsidian 1.15 Smart lists indent, outdent and move a list item together with its children. The plugin
ships its own editor versions of these operations, plus smart Enter, smart Tab, smart select-all and
cursor stick. All of them are opt-in and off by default. They duplicate a native feature, and the
palette commands for indent and move do nothing when the keyboard flags are on (QH-08, cause unknown).

## Scope

Remove, from the editor:

1. The four commands `unisastra:indent-list-item`, `unisastra:outdent-list-item`,
   `unisastra:move-list-up`, `unisastra:move-list-down`.
2. The keymaps behind the five flags: `outliner.isKeyboardOpsEnabled` (`Mod-Shift-ArrowUp` and
   `Mod-Shift-ArrowDown`), `isSmartEnterEnabled` (`Enter`), `isSmartTabEnabled` (`Tab`, `Shift-Tab`),
   `isSmartSelectEnabled` (`Mod-a`), `isCursorStickEnabled` (`ArrowLeft`, `Home`).
3. The five feature toggles and their entries in the settings tab.
4. The five settings keys, and the editor-only functions `smartEnter`, `smartTab`, `smartShiftTab`,
   `smartSelectAll`, `cursorStickLeft`, `cursorStickHome` in `src/cm6/outliner/keyboard-ops.ts`.

## Non-goals

- No change to the Outline panel: its Indent, Outdent, Move up and Move down buttons keep working and keep
  calling `indentListItem`, `outdentListItem`, `moveListItemUp` and `moveListItemDown` through
  `runListOperation`. Those four functions stay.
- No change to `isOutlinerEnabled`, `isOutlinerOnClickEnabled`, `isSidebarOutlineEnabled`, the focus
  commands, block IDs or fold persistence.
- No fix for QH-08. The removal retires it; the ledger keeps the finding.
- No replacement for the removed keymaps beyond what Obsidian provides.

## Decisions (maintainer)

| # | Question | Decision or recommendation |
| --- | --- | --- |
| D1 | What happens to the five keys in an existing `data.json`? | **Decided 2026-11-17: no migration.** The maintainer is the only user, so stale keys in their own `data.json` are left alone and ignored. Original recommendation, not taken: drop them on load, so the next save no longer writes them. Do not touch other keys. Today `applyStartupMigrations` spreads stored groups over the defaults, so unknown keys would survive and be rewritten forever |
| D2 | What happens to a user hotkey bound to a removed command? | **Decided 2026-11-17: nothing in code** (single user). Obsidian keeps an orphan entry in `hotkeys.json`. Obsidian keeps an orphaned entry in `hotkeys.json` and ignores it. Cleaning it needs Obsidian's internal hotkey manager, which is not public API. List the four command IDs in the release note so users can unbind them |
| D3 | `Mod-a` list selection and cursor stick: replace or drop? | **Decided 2026-11-17: drop** (maintainer "lanjut" on the recommendation). Neither is verified to have a native counterpart, and both were off by default. State the loss in the release note. Do not claim Obsidian covers them |
| D4 | Does 0.0.2 carry the removal? | No. Ship the `fix:` changes (QH-06, settings clone, tooling) as 0.0.2. Ship the removal as the next release, as `feat!:` or `refactor!:` with a `BREAKING CHANGE:` footer, so release-please records it. The next version number depends on the release-please config; check it before choosing the type |
| D5 | Rename `keyboard-ops.ts`? | Yes, to `list-operations.ts`, in its own commit after the removal, because only four panel operations remain. Optional; skip if the maintainer prefers a smaller diff |

## Acceptance criteria

1. No settings migration (D1). A stale `data.json` that still holds the five keys must load without error;
   a test shows `applyStartupMigrations` accepts it and the other `outliner` keys are unchanged.
2. The editor extension no longer registers any of the six keymaps. A test builds the outliner extension with
   every remaining setting on and finds no `Tab`, `Shift-Tab`, `Enter`, `Mod-a`, `ArrowLeft`, `Home`,
   `Mod-Shift-ArrowUp` or `Mod-Shift-ArrowDown` binding from the plugin.
3. `getCommands` returns none of the four removed IDs. The focus and outline commands are unchanged.
4. `rg "isKeyboardOpsEnabled|isSmartEnterEnabled|isSmartTabEnabled|isSmartSelectEnabled|isCursorStickEnabled" src`
   matches only the migration code and its test.
5. The tests in `tests/keyboard-ops.test.ts` for move, indent and outdent stay and pass unchanged. The tests for
   smart Enter, smart Tab, smart select-all and cursor stick are removed with their code, not rewritten.
6. Coverage floors in `vitest.config.ts` are not lowered. Removing well-covered code can lower the percentage;
   if the floor fails, add tests for uncovered code elsewhere or ask the maintainer. Record the new measured totals.
7. `pnpm run verify` passes.
8. Native acceptance with real key presses, recorded on Obsidian 1.15.1 or later (see the plan in
   [tasks](tasks.md)): plugin keys do nothing in the editor, Obsidian's own Smart lists work, the Outline panel
   buttons still work, and an old `data.json` with the five flags set loads without error.
9. User docs and the release note list the removed commands, the removed settings and the dropped behaviors
   from D3. [outliner-urd-prd.md](../../reference/outliner-urd-prd.md) gets a short superseded note at the top;
   it is a historical record and is not rewritten.

## Risks

- A user who relied on the opt-in keys loses them with no replacement for `Mod-a` and cursor stick. Mitigation:
  the release note, and the breaking-change release type (D4).
- The Outline panel and the removed commands share `keyboard-ops.ts`. A careless deletion could remove a function
  the panel calls. Mitigation: criterion 5 and the panel acceptance in criterion 8.
- Native behavior with the flags on was only checked through real key presses by hand. The new checks must use
  real key presses too; synthetic events are not evidence.
