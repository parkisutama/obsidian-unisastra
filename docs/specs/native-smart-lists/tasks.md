# Native Smart lists task ledger (QH-07)

Source: [spec](spec.md), [ADR-008](../../reference/decisions/ADR-008-native-smart-lists-and-outline-ops.md). Draft written on 2026-11-17; implementation blocked until the maintainer settles D1 to D5.

| Task | Area | Acceptance / evidence | State |
| --- | --- | --- | --- |
| K0 | Maintainer decisions D1 to D5 | Answers recorded in the spec | Pending |
| K1 | Settings migration, test first | Test with the five keys in `data.json` fails, then passes after the load step drops them; other keys and defaults unchanged; condition inverted to prove the test | Pending |
| K2 | Remove editor keymaps and feature toggles | Extension test (spec criterion 2) fails first, then passes; settings tab shows none of the five toggles | Pending |
| K3 | Remove the four commands | `getCommands` test (criterion 3); focus and outline commands unchanged | Pending |
| K4 | Remove editor-only functions and their tests | Criterion 4 grep clean; move, indent and outdent tests unchanged and green; coverage floors not lowered, new totals recorded | Pending |
| K5 | Rename `keyboard-ops.ts` to `list-operations.ts` (D5, optional) | Separate commit; imports updated; tests green | Pending |
| K6 | Docs and release note | Removed IDs, keys and dropped behaviors listed; superseded note in the PRD; `pnpm run verify` green | Pending |
| K7 | Native acceptance, real key presses | In a disposable vault on Obsidian 1.15.1 or later: with an old `data.json` that has the five flags true, the plugin loads without console error and rewrites settings without them; `Tab`, `Shift-Tab`, `Enter`, `Mod-a`, `Home` and the move shortcuts behave as Obsidian does with the plugin disabled; Outline panel Indent, Outdent, Move up and Move down work; the four command IDs are absent from the palette. Anything not run is listed untested | Pending |
| K8 | Ledger | Mark QH-07 done and QH-08 retired in [quality hardening tasks](../quality-hardening/tasks.md) | Pending |
