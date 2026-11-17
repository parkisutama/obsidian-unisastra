# ADR-008: Use Obsidian Smart lists; keep list operations in the Outline panel only

- Date: 2026-11-17.
- Status: Accepted by the maintainer on 2026-11-17 as a direction. Not implemented.
  The removal needs its own spec, settings migration and release note before code
  changes. Tracked as QH-07 in the [quality-hardening ledger](../../specs/quality-hardening/tasks.md).

## Context

Obsidian 1.15.0 (2026-11-02) added Smart lists: indenting, unindenting and moving a
list item up or down also moves the items nested under it. Obsidian 1.15.1 stopped
Smart lists from indenting more than one level deeper than the item above, and from
moving nested items when text is selected. These cover the job of the plugin's editor
list operations. Those are opt-in (the five `outliner.is*Enabled` keyboard flags are
off by default) and add the `unisastra:indent-list-item`, `outdent-list-item`,
`move-list-up` and `move-list-down` commands.

Native checks on 2026-11-16 and 2026-11-17 (Obsidian 1.15.1, disposable vault):

- With the flags on, the plugin's own handlers ran: `Mod-a` selected the item and then
  its list, `Home` went to the content start, `Tab` and `Enter` acted on the item.
- With the flags on, the palette commands "Indent list item" and "Move list item up"
  changed nothing; with the flags off they worked. The cause was not found.
- Synthetic key events did not reproduce the plugin's behavior. Only real key presses
  are valid evidence for keymap behavior.

The Outline panel reuses the same list-operation code (`runListOperation` with
`indentListItem` and the move functions) and offers indent, outdent and move without
the palette. Its value does not depend on the editor commands.

## Decision

- Use Obsidian's Smart lists for list indenting, outdenting and moving in the editor.
- Remove the plugin's editor list commands and the editor keymaps behind the five
  keyboard flags (keyboard operations, cursor stick, smart enter, smart tab, smart
  select).
- Keep the list operations that the Outline panel calls, and keep the panel itself.
- Do not change the Outline panel's behavior in this decision.

## Consequences

- Command IDs and settings keys are removed, which is a user-visible change. A spec must
  decide the migration: ignore unknown keys on load, or delete them once, and how a
  user's own hotkey bound to a removed command is reported. A minor version is
  likely; the release flow is unchanged.
- The removal retires the open palette-command defect (QH-08) rather than fixing it, so
  its cause stays unknown. Keep the finding in the ledger.
- Tests for `keyboard-ops.ts` that cover only editor keymaps go with them. Tests for
  functions the Outline panel still calls stay. Coverage floors must not be lowered
  to hide the removal; record the new measured totals.
- Items still to settle in the spec: whether `Mod-a` selection and the cursor stick
  have a native replacement, whether other focus commands are in scope, and what the
  settings tab and docs say after the change.

## Alternatives considered

- Keep both: duplicates a native feature and leaves a defect with no known cause.
- Fix the palette commands first: spends effort on a feature the maintainer is
  retiring.
- Remove the Outline panel operations too: not chosen; the panel is the retained
  differentiator and shares the code.
