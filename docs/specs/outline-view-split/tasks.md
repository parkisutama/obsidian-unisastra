# Outline view split task ledger

Source: [spec](spec.md), [plan](plan.md). Plan validated on 2026-11-16, revised on 2026-11-17 (native checkpoint 1c); implementation not started.

| Task | Area | Acceptance / evidence | State |
| --- | --- | --- | --- |
| O1 | Tests for entry collection | Text path (`collectOutlineFromText` through `collectOutlineEntries` on a state-only view stub): headings, nested lists, tasks, frontmatter, empty and malformed input; green on current code. No tree fixture: the tree reader is dead in the live build | Done. 16 tests in `tests/outline-entries.test.ts`; 12 conditions inverted, 11 caught, 1 equivalent (`doc.trim()` guard) |
| O2 | Move step A | Tests unchanged and green; imports resolved | Done. `outline-view.ts` 1486 to 1225 lines; `outline/entries.ts` 295 lines; 377 tests green; build passes; conformance not run here |
| O3 | Tests for tree and task progress | Nesting, filter modes, task rollups; green on current code | Done. 18 tests in `tests/outline-tree.test.ts`; 14 conditions inverted, all caught |
| O4 | Move step B | Tests unchanged and green; line count recorded | Done. `outline-view.ts` 1225 to 1128 lines (1486 at the start); `outline/tree.ts` 107 lines; 395 tests green; build passes; conformance not run here |
| O2b | Delete the tree reader | After O2 and O4 are green and the maintainer approves: remove `collectOutlineFromTree` and its helpers; grep shows no `ListItem` or `ATXHeading` use in tests or fixtures; tests green | Done. Maintainer approved 2026-11-17; grep found no use of the node names in tests, fixtures or scripts; `outline/entries.ts` 295 to 173 lines; 395 tests green; build passes |
| O5 | Native acceptance | Recorded in Obsidian desktop and popout, or listed untested | Done with gaps. Checkpoint 2 on 2026-11-17: desktop passed against 0.0.1; popout and panel move buttons only partly run. See the [handoff](../../handoff/current.md) |
