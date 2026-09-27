# Changelog

## 1.1.0

### Added

- Connect opt-in Live Preview block ID hiding, undoable ID generation on native folds, and per-file fold persistence for uniquely identified list items. Auto-ID can respond to other plugins; internal restore and undo/redo are excluded. Full native acceptance remains pending.
- Add opt-in "Sinkronkan lebar sidebar" in General for synchronized desktop sidebar resizing, with reopening precedence, bounded native sizes, and cleanup on disable. The native adapter is currently verified for Obsidian 1.14.2 only; full host acceptance is pending.
- Add compact settings overview with detail pages for capabilities and writing-mode recipes; group GitHub compatibility under General and Keep Lines under Typewriter. Host acceptance is pending.
- Align new writing-mode recipes with the maintainer's matrix: Normal enables Outliner and Writing disables Hemingway, while preserving saved recipes.
- Add in-development GitHub alert output with five uppercase presets and refusal of incompatible or partial conversions without editing the document. Runtime acceptance is pending.
- Add in-development CSS callout discovery with partial scan reporting, explicit candidate addition, and manual ID fallback. Theme/snippet runtime acceptance is pending.
- Add in-development callout style controls with inherit/override, validated hex colors and Lucide icons, reset, and an Obsidian preview. Runtime acceptance is pending.
- Add GitHub-style heading anchor compatibility for Reading Mode and Live Preview.
- Add a Compatibility settings tab with a toggle for GFM anchor handling.
- Add tests for Unicode slugs, duplicate heading suffixes, anchor parsing, and target resolution.

### Fixed

- Bound synchronized sidebar widths by a shared viewport budget to prevent overflowing workspace geometry from amplifying widths; suspend when native minima cannot fit. Deployment and native acceptance of this correction remain pending.
- Clean up editor observers and pending callbacks, cancel delayed MonoNote work, and remove Hemingway listeners from their original document.
- Apply presets without intermediate settings writes, skip inactive toolbar/GFM work, and prevent stale outline renders and accumulating render components. Native acceptance remains pending.
- Connect sidebar outline branches across multiline rows, round branch elbows, and highlight only the hovered, focused, or active path. Maintainer accepted the reported fix and closed the issue.
- Scope the clickable editor area to Markdown source views so Canvas card editors do not receive a viewport-height pseudo-element that can trigger repeated card growth. Maintainer confirmed the reported issue resolved with Advanced Canvas 7.0.0.
- Dim inactive rendered callout wrappers in Dim Unfocused without multiplying nested callout opacity. Maintainer confirmed the reported dimming issue resolved in Obsidian.
- Correct in-development callout icon overrides to use Obsidian icon IDs and refresh preview icons; show recognized inherited values in the style form.
- Navigate Live Preview GFM anchor clicks without Obsidian's yellow subpath highlight.
- Move the editor cursor to the resolved Live Preview heading instead of only scrolling the target into view.

## 1.0.1

### Added

- Add a normal writing mode preset and command coverage for writing mode changes.
- Add release workflow documentation for commit, push, QA, and GitHub release steps.
- Add Obsidian plugin audit documentation and release planning notes.

### Changed

- Improve the development watcher so source changes rebuild and redeploy during local development.
- Move pnpm build approvals to `pnpm-workspace.yaml` to match current pnpm configuration behavior.
- Simplify Writing Focus by removing the vignette styling path.

### Fixed

- Restore cursor positions per editor view instead of applying one shared position too broadly.
- Use the active Obsidian document or editor owner document for popout-window compatibility.

## 1.0.0

Initial release of MD Writer.

- Typewriter scrolling
- Whitespace visualization
- Outliner zoom focus
- Dimming / focus mode
- Hemingway mode
- Writing focus
- Cursor position restore
- Max characters per line
