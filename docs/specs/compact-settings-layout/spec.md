# Compact settings layout

Status: Accepted by maintainer on 2026-09-14; PLAN is the next validation gate.

## Objective

Make MD Writer settings easier to navigate as capabilities grow. Replace the
14-tab layout with a Linter-inspired overview and compact rows that open detail
pages. Avoid rendering every preset switch or capability setting in one long
page. The maintainer's screenshots are visual references; their request and
preset table define the requirements.

## Scope and behavior

- The overview presents General settings, Toolbar, Callouts, Writing modes
  presets, and Capabilities without the existing multi-row tab bar.
- GitHub heading-anchor compatibility appears under General. Its persisted
  settings key and runtime behavior remain compatible.
- Writing modes retains the active-mode selector. Normal, Idea, Writing, and
  Editing each have a compact chevron row opening their editable preset recipe.
- Capabilities uses compact chevron rows for Writing Focus, Outliner,
  Hemingway, Dimming, Current Line, Typewriter, Whitespace, and Line Width.
- Keep Lines settings appear inside Typewriter as an alternative scrolling
  option. Existing mutual-exclusion behavior is preserved and explained there.
- Each detail page offers an accessible return to the overview. Keyboard,
  narrow mobile layouts, and popout contexts must remain usable.
- Preset editing saves the recipe without applying it to live features until
  the user activates that mode. None retains manual feature management.
- Existing direct navigation to Callouts continues to work.

## Default preset matrix

Empty cells in the supplied table mean Off. These defaults apply to new or
missing preset values; explicitly saved user recipes are preserved.

| Capability | Normal | Idea | Writing | Editing |
| --- | --- | --- | --- | --- |
| Writing Focus | Off | On | On | Off |
| Outliner | On | On | Off | Off |
| Hemingway | Off | On | Off | Off |
| Dimming | Off | Off | On | Off |
| Current Line | Off | Off | Off | On |
| Typewriter / Keep Lines | Off | Off | Typewriter | Off |
| Whitespace | Off | Off | Off | On |
| Line Width | Off | Off | Off | On |

Source inspection: current defaults differ at Normal/Outliner (currently Off)
and Writing/Hemingway (currently On). Normal descriptions currently promise
to disable all managed effects and must be updated to match its new recipe.
The current initial active mode is None; this request does not select a new
initial active mode. Keep Lines is not currently a preset field; grouping its
UI does not automatically add a new persisted recipe field.

## Compatibility and non-goals

Preserve plugin ID, command IDs, stored settings keys, existing saved recipes,
Markdown content, CSS compatibility hooks, and composition responsibilities.
Do not reset existing users' presets, change editor algorithms, redesign the
Callout manager internals, add dependencies, or deploy to a vault. Commit,
push, and release require authorization in their own scope.

## Source and project conventions

Relevant source: `src/components/settings-tab.ts`,
`src/capabilities/features/writing-modes/`, `src/capabilities/settings.ts`,
capability setting renderers, and `src/styles/`. Tests live in `tests/`.
Documentation uses the existing VitePress navigation conventions.
Use TypeScript, Obsidian Setting/SettingGroup, lifecycle cleanup, and the
editor's document/window for DOM operations. Preserve the current style:

```ts
settingGroup.addSetting((setting) =>
  setting.setName("Active writing mode").setClass("md-writer-setting")
);
```

## Acceptance and verification

1. Overview has no 14-tab navigation and no expanded preset toggle lists.
2. Every capability and preset is reachable through a named chevron row and
   offers a return action; keyboard activation and focus are usable.
3. Compatibility is reachable under General; Keep Lines under Typewriter.
4. New/missing defaults match every cell above, with saved overrides preserved.
5. Activating Normal enables Outliner according to its recipe; Writing does
   not enable Hemingway by default. UI descriptions match those behaviors.
6. Preset edit/apply separation, scrolling exclusion, Callouts entry point,
   settings persistence, and cleanup have regression coverage where practical.
7. Run `pnpm run check`, `pnpm run test`, and `pnpm run check:ci` (including
   build, artifact verification, and docs build). Build without deployment.
8. Record actual Obsidian desktop/mobile/popout acceptance separately, including
   navigation, scrolling length, focus, switching modes, and reopening settings.

Always inspect relevant source/tests and preserve local changes. Validate this
spec before PLAN, the plan before TASKS, and tasks before IMPLEMENT, following
AGENTS.md. Document a compatibility decision before implementation if the plan
changes a settings contract. Automated checks do not establish host acceptance.

## Maintainer validation

Runtime visual correction requested on 2026-09-14: General and GitHub must
share one background; preset rows and Capabilities need shared dark panels;
Toolbar needs overview/detail descriptions and a clear title; Back becomes
an accessible chevron icon aligned with the title. Capabilities explains its
relationship to writing-mode feature behavior and recipes. Theme tokens keep
the dark panel appearance compatible with light themes.

Maintainer confirmed the overview with separate detail pages: "ya ini maksud
saya lanjutkan". The preset matrix is transcribed directly from the request.
