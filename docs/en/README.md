# MD Writer documentation

Dokumentasi ini diatur berdasarkan aksi yang paling mungkin dilakukan oleh dua
persona utama:

- pengguna plugin yang ingin memasang, memakai, dan memperbaiki masalah MD
  Writer di Obsidian,
- developer atau maintainer yang ingin berkontribusi, menjalankan QA, dan
  merilis perubahan.

## Pengguna plugin

Mulai dari sini jika tujuan Anda adalah memakai MD Writer di vault Obsidian:

- [Install MD Writer](./for-users/install-md-writer.md)
- [Use MD Writer features](./for-users/use-md-writer-features.md)
- [Troubleshoot MD Writer](./for-users/troubleshooting.md)

Informasi singkat untuk pengguna juga tersedia di
[README utama](https://github.com/parkisutama/obsidian-md-writer/blob/main/README.md).

## Developer dan maintainer

Untuk bekerja dengan AI, mulai dari
[AI Assisted Development](./for-developers/ai-assisted-development.md),
[current state](./current-state.md), dan [development status](./development-status.md).

Mulai dari sini jika tujuan Anda adalah mengubah kode, dokumentasi, atau release:

- [Set up local development](./for-developers/setup-local-development.md)
- [Start a feature or bugfix](./for-developers/start-a-feature-or-bugfix.md)
- [Run QA before merge or release](./for-developers/run-qa-before-merge-or-release.md)
- [Commit, push, and release a change](./for-developers/commit-push-and-release.md)
- [Create a GitHub release for BRAT and Obsidian](./for-developers/create-a-github-release.md)
- [Ship a change from branch to GitHub release](./for-developers/ship-a-change-from-branch-to-release.md)
- [Documentation guidelines](./for-developers/documentation-guidelines.md)
- [SDLC for this plugin](./for-developers/sdlc-for-this-plugin.md)

Quickstart contributor tetap ada di
[DEVELOPMENT.md](https://github.com/parkisutama/obsidian-md-writer/blob/main/DEVELOPMENT.md).

## Reference

- [Architecture baseline](./reference/code-architecture-baseline.md)
- [ADR-001: AI context and gates](./reference/decisions/ADR-001-ai-development-context-and-gates.md)
- [ADR-002: toolbar and callout management (Accepted)](./reference/decisions/ADR-002-floaty-toolbar-and-callout-management.md)

Gunakan bagian ini untuk aturan stabil, checklist, dan spesifikasi panjang:

- [Branching conventions](./reference/branching-conventions.md)
- [Release gates](./reference/release-gates.md)
- [Outliner integration URD, PRD, and implementation plan](./reference/outliner-urd-prd.md)
- [Obsidian plugin audit prompts](./reference/obsidian-plugin-audit-prompts.md)

## Active specifications

- [Compact settings: accepted spec](./specs/compact-settings-layout/spec.md)
- [Compact settings: accepted plan](./specs/compact-settings-layout/plan.md)
- [Compact settings: implementation and acceptance ledger](./specs/compact-settings-layout/tasks.md)
- [Editor bug fixing: accepted spec](./specs/editor-bug-fixing/spec.md)
- [Editor bug fixing: accepted plan](./specs/editor-bug-fixing/plan.md)
- [Editor bug fixing: accepted tasks](./specs/editor-bug-fixing/tasks.md)
- [Floaty Toolbar adoption: accepted spec](./specs/floaty-toolbar/spec.md)
- [Floaty Toolbar: accepted implementation plan](./specs/floaty-toolbar/plan.md)
- [Floaty Toolbar: draft task breakdown](./specs/floaty-toolbar/tasks.md)

## Archive

Dokumen di archive disimpan untuk riwayat proyek. Jangan jadikan sumber utama
kecuali dokumen aktif menautkannya sebagai konteks.

- [Active document warning cleanup release plan](./archive/release-plan-active-document-warnings.md)
- [Obsidian plugin audit report, 2026-05-14](./archive/obsidian-plugin-audit-report-2026-05-14.md)

## Folder map

- `for-users/`: aktivitas pengguna plugin.
- `for-developers/`: aktivitas contributor dan maintainer.
- `reference/`: aturan, checklist, audit prompt, dan spesifikasi.
- `archive/`: catatan historis.
