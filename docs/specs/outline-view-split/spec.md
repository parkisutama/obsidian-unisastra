# Outline view split spec

Status: Plan validated against the code on 2026-11-16 (see the plan's corrections). The maintainer authorized QH-03 on the same date; approval of the corrected plan is still needed before implementation.
Date: 2026-11-16.
Source: [quality audit, QH-03](../../audit/2026-11-16-quality-pass/REPORT.md), [quality hardening](../quality-hardening/spec.md).

## Problem

`src/components/outline-view.ts` has 1486 lines. It holds Markdown parsing into outline
entries, tree and task-progress computation, filter and collapse persistence, and DOM
rendering. A reader must hold all of it to change any part, and the pure parts have no
tests because they are bound to the view class.

## Scope

Move the pure logic out of the file into focused modules, add characterization tests for it,
and leave the view class responsible only for Obsidian lifecycle and DOM.

## Non-goals

- No change in behavior, DOM structure, CSS classes, view type or command IDs.
- No change to settings keys, persisted collapse or filter state, or block IDs.
- No new feature, option or dependency.

## Acceptance criteria

1. Characterization tests for the extracted functions pass against the code **before** the move
   and against the moved code unchanged.
2. `OUTLINE_VIEW_TYPE` and the `OutlineView` export keep their import path for `src/lib.ts`
   and `outliner-sidebar.ts`.
3. `outline-view.ts` shrinks by the extracted code; no copy of that code remains.
4. `pnpm run verify` passes. The performance budget test and its outline fixture still pass.
5. Acceptance in Obsidian desktop and popout is recorded: open the Outline panel on a note with
   headings, nested lists and tasks; switch filters; collapse and expand; toggle a task; reveal
   the active node. If not run, it is listed untested and the change is not called ready.
