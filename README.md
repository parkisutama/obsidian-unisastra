# Unisastra

Unisastra is a specialized Obsidian editor environment for high-precision drafting and structural focus. It combines typewriter scrolling, whitespace visualization, and outliner-centric navigation into a workflow for long-form prose and complex technical notes.

## Features

**Typewriter Scrolling**: The active line remains fixed at a specific vertical position on the screen. Alternatively, use *Keep Lines Above and Below* to always maintain a set number of context lines around the cursor.

**Outliner Zoom** (Logseq-style): Focus on specific headings or list items and their children for deep thinking, inspired by Obsidian Zoom. Designed to pair with the sidebar outline and zoom-on-bullet-click without adding an in-editor breadcrumb bar.

**Show Whitespace**: Visualize spaces, tabs, trailing spaces, and two-space strict line breaks to maintain precise Markdown formatting.

**Hemingway Mode**: Write forwards only by disabling the ability to edit previous text. Optionally allow backspace and display a status bar indicator.

**Current Line Highlighting**: Visual emphasis on the active row with customizable styles (box, underline, background), colors, and fade intensity for surrounding lines.

**Focus Dimming**: Unfocused paragraphs or sentences are dimmed to reduce distraction. Supports paragraph and sentence granularity, with configurable opacity and pause-on-scroll/select.

**Line Width**: Limit the editor column to a comfortable reading width (measured in `ch`, the character-width CSS unit). Separately, warn when a raw document line (in practice, one paragraph — Obsidian doesn't hard-wrap prose) exceeds a character count, to keep paragraphs skimmable and diffs clean. A true per-sentence effectiveness warning is a possible future direction, pending research into a sensible threshold.

**Writing Focus**: Distraction-free fullscreen writing mode with custom font size and togglable header/status bar.

**Cursor Persistence**: Automatically restores your exact cursor position when reopening files.

**GitHub-style Heading Anchors**: Navigate GitHub-style heading links in Reading Mode and Live Preview, including duplicate headings and Unicode text, without modifying your Markdown files.

## GitHub-Style Anchor Compatibility

Unisastra can resolve GitHub-style heading anchors such as `#instalasi--setup` to the matching Obsidian heading. This is useful when drafting notes that are also published to GitHub or copied from GitHub-flavored Markdown.

Example note:

```markdown
# Dokumentasi Proyek

## Instalasi & Setup

## Fitur Utama

## Fitur Utama

## Café dan Niño

- [Instalasi & Setup](#instalasi--setup)
- [Fitur Utama](#fitur-utama)
- [Fitur Utama kedua](#fitur-utama-1)
- [Café dan Niño](#café-dan-niño)
- [Setup di file lain](panduan.md#instalasi--setup)
```

The compatibility layer only rewrites link handling at runtime for navigation and hover preview. It does not edit vault files.

## Installation

### Manual installation

1. Download the latest release of Unisastra.
2. Extract the folder to your vault's plugins directory: `<vault>/.obsidian/plugins/unisastra/`.
3. Open the command palette and run `Reload app without saving`.

---

## Positioning

Unisastra follows a different product direction from the original [Typewriter Mode](https://github.com/davisriedel/obsidian-typewriter-mode). The codebase keeps the ergonomic foundation of typewriter scrolling while expanding into whitespace-aware editing and outliner-focused navigation.

## Acknowledgements

The floating toolbar work adapts [Floaty Toolbar](https://github.com/0png/Floaty-Toolbar)
by [0png](https://github.com/0png), licensed under the MIT License.
The adaptation keeps formatting and toolbar ergonomics while excluding Pomodoro
and adding configurable elapsed timer labels, a desktop persistent dock, and
callout management. This work is in progress and has not completed Obsidian
runtime acceptance. The original copyright and full license are preserved in
[the Floaty Toolbar MIT notice](./licenses/floaty-toolbar-MIT.txt) and attributed
in adapted source files.

Unisastra descends from the original [Typewriter Mode](https://github.com/davisriedel/obsidian-typewriter-mode) by [Davis Riedel (davisriedel)](https://github.com/davisriedel), licensed under the MIT License. The build infrastructure was originally derived from [bun-obsidian-plugin-build-scripts](https://github.com/davisriedel/bun-obsidian-plugin-build-scripts), also by Davis Riedel and also MIT-licensed, and has since been migrated to a standard pnpm + esbuild toolchain.

**Inherited and adapted features:**

This plugin started as a fork of the incredible [Typewriter Scroll](https://github.com/deathau/cm-typewriter-scroll-obsidian) plugin by [deathau](https://github.com/deathau). It was turned into a separate plugin because many new features were added, breaking changes were introduced, and the code was completely restructured to make it more extensible.

The sentence highlighting was derived from [Focus Active Sentence](https://github.com/artisticat1/focus-active-sentence) by [artisticat1](https://github.com/artisticat1).

The writing focus was derived from [Obsidian Focus Mode](https://github.com/ryanpcmcquen/obsidian-focus-mode) by [ryanpcmcquen](https://github.com/ryanpcmcquen), licensed under the Mozilla Public License 2.0. The affected files (`src/capabilities/commands/writing-focus/`) remain under that license; see the `EXCEPTION` clause in [LICENSE](./LICENSE) and [licenses/writing-focus-MPL2.0.txt](./licenses/writing-focus-MPL2.0.txt).

The restore cursor position feature was derived from [Remember Cursor Position](https://github.com/dy-sh/obsidian-remember-cursor-position) by [dy-sh](https://github.com/dy-sh).

The hemingway mode feature was derived from [Obsidian Hemingway Mode](https://github.com/jobedom/obsidian-hemingway-mode) by [jobedom](https://github.com/jobedom).

The "Keep one tab per note" general setting was derived from [MonoNote](https://github.com/czottmann/obsidian-mononote) by [Carlo Zottmann (czottmann)](https://github.com/czottmann).

**Additional features in this modification:**

- [Show Whitespace](https://github.com/deathau/cm-show-whitespace-obsidian) by [deathau](https://github.com/deathau)
- [Obsidian Zoom](https://github.com/vslinko/obsidian-zoom) by [vslinko](https://github.com/vslinko)

Many thanks to the developers of these fantastic plugins. Please also consider supporting them.

## Development and project docs

Contributor setup lives in [DEVELOPMENT.md](./DEVELOPMENT.md). Project workflow,
release, and planning notes live in [docs/](./docs/README.md).

## Privacy and network use

Unisastra stores its settings and cursor-position history in the plugin data file managed by Obsidian.

Unisastra does not fetch release notes or send vault content over the network.

## License

The plugin is licensed under the MIT license.
