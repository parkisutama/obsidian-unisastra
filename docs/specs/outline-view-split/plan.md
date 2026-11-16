# Outline view split plan

Status: Proposed. Needs maintainer validation before implementation.
Requirements: [spec.md](spec.md). Depends on QH-02 in [quality hardening](../quality-hardening/plan.md).

## Approach

Extract in two steps, each with tests written first against the existing code.

| Step | Move | From lines (current) | To |
| --- | --- | --- | --- |
| A | Entry types and collection: `collectOutlineEntries`, tree and text collectors, heading and list entry creators, task-state helpers, the regular expressions | 33–320 | `src/components/outline/entries.ts` |
| B | `buildTreeEntries`, `getTaskProgress`, `getTaskProgressTone` as pure functions over entries | 480–650, 1409–1420 | `src/components/outline/tree.ts` |

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
