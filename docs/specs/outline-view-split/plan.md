# Outline view split plan

Status: Validated against the code on 2026-11-16, with the corrections below. Maintainer approval of the corrected plan is still needed before implementation.
Requirements: [spec.md](spec.md). Depends on QH-02 in [quality hardening](../quality-hardening/plan.md).

## Approach

Extract in two steps, each with tests written first against the existing code.

| Step | Move | From lines (current) | To |
| --- | --- | --- | --- |
| A | Entry types and collection: `collectOutlineEntries`, tree and text collectors, heading and list entry creators, task-state helpers, the regular expressions | 33–320 | `src/components/outline/entries.ts` |
| B | `buildTreeEntries` (480–529), `getTaskProgress` (595–617), `getTaskProgressTone` (1409–1420) as pure functions over entries | as listed | `src/components/outline/tree.ts` |

Corrections from validation:

- Step B range was too wide. `getVisibleEntries`, `isEntryStructurallyVisible`,
  `hasChildHeadingWithTaskProgress` and `shouldShowTaskProgress` read `this.collapseState` or
  `this.treeEntries`; they stay in the view. Only the three functions above have no `this`.
- Step A imports `getLineContentEndBeforeBlockId` from `@/cm6/outliner/utils`. That file imports
  no `obsidian` module, so the "no `obsidian`" rule holds. Allowed imports for the new modules:
  `@codemirror/*` and `@/cm6/outliner/utils`.
- Test strategy for O1. The text fallback (`collectOutlineFromText`, via `collectOutlineEntries`
  on a view stub with only `state`) runs in node. The tree path reads Lezer-markdown node names
  (`ATXHeadingN`, `SetextHeading1/2`, `ListItem`), not the HyperMD names in
  `tests/fixtures/hypermd-state.ts`. O1 needs a second small fixture that builds those nodes
  with `@lezer/common`. Its tree shape is an assumption until native acceptance.
- `tests/fixtures/performance-outline.ts` imports `OutlineView` from its current path; the
  re-export keeps it working.

Rejected: extracting rendering helpers (`renderEntryLead`, `buildItemActions`, `createItemAction`).
They depend on view state and the DOM; splitting them adds parameter lists without removing concepts.

Dependency direction: `outline-view.ts` imports `outline/entries.ts` and `outline/tree.ts`;
those two import only `@codemirror/*` types and each other, never `obsidian`.

## Risks

- A moved regular expression or helper changes behavior. Mitigation: characterization tests
  first, then move without editing bodies.
- Circular import between the view and the new modules. Mitigation: shared types live in
  `entries.ts`.
- Mobile and popout: no DOM code moves, so lifecycle and window handling are untouched.

## Verification

`pnpm run check` after each step; `pnpm run verify` at the end, in the sandbox described in
the quality hardening plan; native acceptance as in the spec.
