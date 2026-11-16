# Compact settings implementation plan

Status: Accepted by maintainer on 2026-09-14: "oke lanjutkan ke task".
Requirements: [accepted spec](./spec.md).
Implementation and automated gates completed; host acceptance remains Pending
in [tasks](./tasks.md).

## Navigation and rendering

Keep `TypewriterModeSettingTab` as the composition point. Replace tab-bar
rendering with an overview and a single current detail page. General settings
and GitHub compatibility render inline at the top of the overview. Toolbar
and Callouts become compact navigation rows; their existing renderers stay
on their detail pages. The active writing-mode selector remains inline,
followed by four preset rows and eight capability rows.

Use native buttons styled as full-width Obsidian setting rows, with a label,
short description where useful, and a decorative chevron. Enter/Space use
native activation. Detail pages have a Back button and title; navigation
moves focus to the page title and return restores the originating row and
overview scroll position. Narrow screens wrap text without horizontal overflow.
Keep existing `tm-settings` and `md-writer-setting` hooks; add scoped styles
instead of changing editor CSS or using a separate modal.

Retain `setActiveTab("callouts")` as the internal direct-navigation entry
used by `TypewriterModeLib.openCalloutManager()`. Clear Callout preview
components when leaving the page or hiding settings. Keep redraw guards
against disconnected containers, hidden settings, and stale page callbacks.
Toolbar reorder redraws remain local to the Toolbar detail page.

## Preset rendering and defaults

Extract a per-mode rendering entry from `WritingModePresetConfig` so opening
one preset renders only its eight switches. Keep recipe persistence and
live activation separate; the overview registers only the active-mode feature.
Update Normal descriptions in both preset and selector renderers.

Change only default Normal/Outliner to true and Writing/Hemingway to false.
Retain the existing deep merge for missing fields and stored overrides,
including old complete recipes. Do not infer whether a saved recipe was
customized and do not reset it. Initial active mode remains None.

No settings keys, recipe schema, command identifiers, Markdown format, or
dependency direction change is planned. The accepted spec records the
default-value decision; a schema migration ADR is unnecessary for this approach.

## Typewriter and Keep Lines

Render both existing feature groups on the Typewriter detail page with clear
section headings and an explanation of their alternative scrolling behavior.
Their current enable switches disable each other at render time. Refresh the
affected controls after a scrolling switch changes so switching alternatives
does not require leaving and reopening settings. Preserve saved values,
feature toggle side effects, and existing runtime scrolling algorithms.
Avoid changing the shared FeatureToggle behavior for unrelated capabilities.

## Verification and risks

- Extend settings tests to assert the complete matrix and preserve explicit
  saved overrides; extend writing-mode tests for Normal, Writing, and None.
- Add a settings navigation harness using the existing Vitest mock approach:
  overview grouping, detail selection/return, only one preset rendered,
  direct Callouts entry, preview cleanup, and stale redraw prevention.
- Cover Typewriter control refresh and existing exclusion, plus preset edits
  saving without applying live feature changes.
- Run targeted tests and `pnpm run check` during implementation; run
  `pnpm run check:ci` after the completed changes. No dependency install or
  deployment is planned. Mock DOM tests do not prove actual focus or appearance.
- Host acceptance remains separate: desktop, narrow mobile, popout, keyboard
  navigation, Back focus/scroll, reopen, Callouts lifecycle, Toolbar reorder,
  scrolling alternative selection, and mode activation.

Main risks are losing focus/scroll on redraw, retaining stale Callouts callbacks,
and accidentally registering all presets on the overview. Render the current
page only, guard redraws, and test these boundaries. Existing users with saved
old recipes retain those recipes; document why their values may differ from
new defaults.

## Delivery order and documentation

After plan approval, create vertical tasks for navigation/capability grouping,
preset/default behavior, and verification/documentation. Each slice includes
its relevant tests and documentation before proceeding. Update user settings
instructions, current state, architecture baseline, development status, and
user-facing changelog in the final verified scope. Keep this spec folder active
while host acceptance is pending. No commit/push/release is currently authorized.

Alternative considered: expandable inline groups would still accumulate page
height as groups open. Separate details match the maintainer-approved overview
and give each capability its own focused editing space.
