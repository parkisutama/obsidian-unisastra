# Outline view split plan

Status: Validated against the code on 2026-11-16 and revised on 2026-11-17 after native checkpoint 1c. Maintainer approval of the revised plan is still needed before implementation.
Requirements: [spec.md](spec.md). Depends on QH-02 in [quality hardening](../quality-hardening/plan.md).

## Approach

Extract in two steps, each with tests written first against the existing code, then remove the dead tree reader in a third, separate step.

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
- Test strategy for O1 (superseded by the revision below for the tree path). The text fallback (`collectOutlineFromText`, via `collectOutlineEntries`
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

## Revision after native checkpoint 1c (2026-11-17)

Windows showed the live tree (Obsidian 1.15.1) has no `ListItem` or `ATXHeading*` nodes: list
lines are `HyperMD-list-line_HyperMD-list-line-N` and headings `HyperMD-header_HyperMD-header-N`.
The tree reader (`collectOutlineFromTree` and its node helpers) returns nothing live, so
`collectOutlineEntries` always uses the text fallback, and the text path is the real behavior.

- Step A moves the text path as the primary behavior, with characterization tests first
  (`collectOutlineFromText`, list depth already covered by `tests/outline-text-depth.test.ts`).
- The tree reader moves unchanged and untested: it is dead in the live build, and a
  Lezer-markdown fixture would characterize code nobody runs. This exempts it from
  acceptance criterion 1; the exemption ends with step C.
- Step C (new): delete the tree reader and `collectOutlineEntries` falls straight to the text
  path. Separate `refactor:` commit after A and B are green. It needs maintainer approval,
  because another Obsidian build or the performance fixture might still produce those nodes.
  Before deleting, grep tests and fixtures for `ListItem` and `ATXHeading`.
- The earlier plan for a second, Lezer-markdown fixture is dropped.

## Risks

- A moved regular expression or helper changes behavior. Mitigation: characterization tests
  first, then move without editing bodies.
- Circular import between the view and the new modules. Mitigation: shared types live in
  `entries.ts`.
- Mobile and popout: no DOM code moves, so lifecycle and window handling are untouched.

## Verification

`pnpm run check` after each step; `pnpm run verify` at the end, in the sandbox described in
the quality hardening plan; native acceptance as in the spec.
